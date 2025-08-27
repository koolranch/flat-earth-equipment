export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

function clean(s:string){ return (s||'').trim(); }
function up(s:string){ return clean(s).toUpperCase(); }

function inferModel(input?: string | null){
  const s = up(input || '');
  if(s.includes('1044C-54')) return '1044C-54 Series II';
  if(s.includes('944E-42')) return '944E-42';
  if(s.includes('644E-42')) return '644E-42';
  return null;
}

export async function POST(req: Request){
  try{
    const { serial, model } = await req.json();
    if(!serial && !model){
      return NextResponse.json({ error: 'Provide at least a serial/PIN or a model.' }, { status: 400 });
    }

    const db = supabaseService();
    const normalizedModel = inferModel(model) || inferModel(serial || '') || model || null;

    // Plate guidance
    let plateTips:any[] = [];
    if(normalizedModel){
      const { data } = await db.from('lull_plate_locations')
        .select('equipment_type,series,location_notes')
        .eq('series', normalizedModel);
      if(data && data.length) plateTips = data;
    }
    if(!plateTips.length){
      const { data } = await db.from('lull_plate_locations')
        .select('equipment_type,series,location_notes')
        .eq('equipment_type','Telehandler');
      plateTips = data || [];
    }

    // Model-specific notes & ranges
    let modelNotes:any[] = [];
    let ranges:any[] = [];
    if(normalizedModel){
      const { data: n } = await db.from('lull_model_serial_notes')
        .select('model_code,note').ilike('model_code', `%${normalizedModel}%`);
      modelNotes = n || [];
      const { data: r } = await db.from('lull_model_serial_ranges')
        .select('model_code,serial_range,notes').ilike('model_code', `%${normalizedModel}%`);
      ranges = r || [];
    }

    const notes:string[] = [
      'Use the machine serial-number plate and record the full serial exactly as shown.',
      'On some models (e.g., 1044C-54 Series II), the plate is behind the right-front tire.',
      'Record component serials when applicable (engine plate, front/rear axle, attachment plate).'
    ];
    const disclaimer = 'Lull/JLG manuals use serial ranges for parts & options. There is no universal public year decoder; match your exact S/N to the correct documentation when ordering parts.';

    return NextResponse.json({ input: { serial: clean(serial||''), model: clean(model||'') }, match: { normalizedModel }, plate: { guidance: plateTips }, modelNotes, serialRanges: ranges, notes, disclaimer });
  } catch(e:any){
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
