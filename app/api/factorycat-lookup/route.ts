export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

function clean(s:string){ return (s||'').trim(); }
function up(s:string){ return clean(s).toUpperCase(); }

function inferFamily(input?: string | null){
  const s = up(input || '');
  if(/^MICROMAG|^MICROMINI|^MINI-HD|^MAG-HD/.test(s)) return 'Walk-behind Scrubber';
  if(/^XR\b|^GTX\b|^GTR\b|^PILOT\b/.test(s)) return 'Rider Scrubber';
  if(/^TR\b/.test(s)) return 'Rider Sweeper';
  if(/^34\b/.test(s)) return 'Walk-behind Sweeper';
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
      const { data } = await db.from('factorycat_plate_locations')
        .select('equipment_type,series,location_notes')
        .eq('equipment_type', family);
      plateTips = data || [];
    } else {
      const { data } = await db.from('factorycat_plate_locations')
        .select('equipment_type,series,location_notes')
        .limit(8);
      plateTips = data || [];
    }

    // Model-level notes & ranges
    let modelNotes:any[] = [];
    let ranges:any[] = [];
    if(model){
      const { data: n } = await db.from('factorycat_model_serial_notes')
        .select('model_code,note')
        .ilike('model_code', `%${model}%`);
      modelNotes = n || [];
      const { data: r } = await db.from('factorycat_model_serial_ranges')
        .select('model_code,serial_range,notes')
        .ilike('model_code', `%${model}%`);
      ranges = r || [];
    }

    const notes:string[] = [
      'Use the machine data/ID plate and record the full serial number exactly as shown.',
      'Factory Cat parts manuals often split assemblies by serial breaks (e.g., ≤56483 vs ≥56484). Use your exact S/N.'
    ];
    const disclaimer = 'Factory Cat does not publish a universal year-decoder. Use the exact serial from the plate to select correct parts/service info.';

    return NextResponse.json({ input: { serial: clean(serial||''), model: clean(model||'') }, parsed: { family }, plate: { guidance: plateTips }, modelNotes, serialRanges: ranges, notes, disclaimer });
  } catch(e:any){
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
