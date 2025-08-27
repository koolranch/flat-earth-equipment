export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

function clean(s:string){ return (s||'').trim(); }
function up(s:string){ return clean(s).toUpperCase(); }

function inferFamily(input?: string | null){
  const s = up(input || '');
  if(/^T3/.test(s)) return 'Scrubber (Walk-behind/Stand-on)';
  if(/^T7\b|^T12\b|^T16\b|^T20\b/.test(s)) return 'Scrubber (Rider)';
  if(/^S20\b|^S30\b/.test(s)) return 'Sweeper (Rider)';
  if(/^M20\b|^M30\b/.test(s)) return 'Sweeper-Scrubber (Rider)';
  if(/^B10\b/.test(s)) return 'Burnisher';
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

    // Plate guidance
    let plateTips:any[] = [];
    if(family){
      const { data } = await db.from('tennant_plate_locations')
        .select('equipment_type,series,location_notes')
        .eq('equipment_type', family);
      plateTips = data || [];
    } else {
      const { data } = await db.from('tennant_plate_locations')
        .select('equipment_type,series,location_notes')
        .limit(8);
      plateTips = data || [];
    }

    // Model-level notes & ranges
    let modelNotes:any[] = [];
    let ranges:any[] = [];
    if(model){
      const { data: n } = await db.from('tennant_model_serial_notes')
        .select('model_code,note')
        .ilike('model_code', `%${model}%`);
      modelNotes = n || [];
      const { data: r } = await db.from('tennant_model_serial_ranges')
        .select('model_code,serial_range,notes')
        .ilike('model_code', `%${model}%`);
      ranges = r || [];
    }

    const notes:string[] = [
      'Use the machine data/ID plate and record the full serial number exactly as shown.',
      'Tennant operator/parts manuals require model + serial for parts/service and often include S/N-based sections.'
    ];
    const disclaimer = 'Tennant does not publish a universal year-decoder. Use the exact serial from the data plate to select correct parts/service info.';

    return NextResponse.json({ input: { serial: clean(serial||''), model: clean(model||'') }, parsed: { family }, plate: { guidance: plateTips }, modelNotes, serialRanges: ranges, notes, disclaimer });
  } catch(e:any){
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
