export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

function clean(s:string){ return (s||'').trim(); }
function up(s:string){ return clean(s).toUpperCase(); }

function inferFamily(input?: string | null){
  const s = up(input || '');
  if(/^HA\b|\bRTJ\b/.test(s)) return 'Articulating Boom';
  if(/^HT\b/.test(s)) return 'Telescopic Boom';
  if(/^(COMPACT|H\d{2}SX)/.test(s)) return 'Scissor (Electric/RT)';
  if(/^OPTIMUM/.test(s)) return 'Scissor (Electric)';
  if(/^STAR/.test(s)) return 'Vertical Mast';
  if(/^HTA|^\d{4}A\b/.test(s)) return 'Trailer Boom';
  return null;
}

export async function POST(req: Request){
  try{
    const { serial, model } = await req.json();
    if(!serial && !model){
      return NextResponse.json({ error: 'Provide at least a serial/PIN or a model.' }, { status: 400 });
    }

    const db = supabaseService();
    const family = inferFamily(model) || inferFamily(serial || '');

    let plateTips:any[] = [];
    if(family){
      const { data } = await db.from('haulotte_plate_locations')
        .select('equipment_type,series,location_notes')
        .eq('equipment_type', family);
      plateTips = data || [];
    } else {
      const { data } = await db.from('haulotte_plate_locations')
        .select('equipment_type,series,location_notes')
        .limit(8);
      plateTips = data || [];
    }

    let modelNotes:any[] = [];
    if(model){
      const { data } = await db.from('haulotte_model_serial_notes')
        .select('model_code,note')
        .ilike('model_code', `%${model}%`);
      modelNotes = data || [];
    }

    const notes: string[] = [
      'Use the manufacturer/ID plate and record the full serial number exactly as shown.',
      'Haulotte manuals instruct you to provide the model and serial when requesting support or parts.'
    ];

    const disclaimer = 'Haulotte does not publish a universal year-decoder. For parts/service, quote the full serial from the manufacturer plate.';

    return NextResponse.json({ input: { serial: clean(serial||''), model: clean(model||'') }, parsed: { family }, plate: { guidance: plateTips }, modelNotes, notes, disclaimer });
  } catch(e:any){
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
