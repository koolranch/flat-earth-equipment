import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function clean(s:string){ return (s||'').trim(); }
function up(s:string){ return clean(s).toUpperCase(); }

function familyFromModel(model:string|null){
  const s = up(model || '');
  if(/^CPD/.test(s)) return 'Electric Counterbalance';
  if(/^CPCD/.test(s)) return 'IC Counterbalance';
  if(/^CPQ/.test(s)) return 'IC Counterbalance';
  if(/^CQD/.test(s)) return 'Reach Truck';
  if(/^CBD/.test(s)) return 'Pallet Truck';
  if(/^CDD/.test(s)) return 'Stacker';
  if(/^CJD/.test(s)) return 'Order Picker';
  return null;
}

export async function POST(req: Request){
  try{
    const { serial, model } = await req.json();
    if(!serial && !model){
      return NextResponse.json({ error: 'Provide at least a serial/PIN or a model.' }, { status: 400 });
    }

    const db = supabase();
    const fam = familyFromModel(model) || familyFromModel(serial || null);

    // Plate guidance
    let plateTips:any[] = [];
    if(fam){
      const { data } = await db.from('hc_plate_locations')
        .select('equipment_type,series,location_notes')
        .eq('equipment_type', fam);
      plateTips = data || [];
    } else {
      const { data } = await db.from('hc_plate_locations')
        .select('equipment_type,series,location_notes')
        .limit(8);
      plateTips = data || [];
    }

    // Model-level notes
    let notesByModel:any[] = [];
    if(model){
      const { data } = await db.from('hc_model_serial_notes')
        .select('model_code,note')
        .ilike('model_code', `%${model}%`);
      notesByModel = data || [];
    }

    // Serial ranges (if you add later)
    let ranges:any[] = [];
    if(model){
      const { data } = await db.from('hc_model_serial_ranges')
        .select('model_code,serial_range,notes')
        .ilike('model_code', `%${model}%`);
      ranges = data || [];
    }

    const notes:string[] = [];
    notes.push('Use the truck data/ID plate and record the full serial/PIN exactly as shown.');
    notes.push('Hangcha manuals repeatedly instruct to quote the truck serial when requesting information or ordering spare parts.');
    if(fam === 'IC Counterbalance') notes.push('On CPCD/CPQ models, the chassis serial is typically printed on the right/front-right of the frame; engine serial is on the engine nameplate.');

    return NextResponse.json({
      input: { serial: clean(serial||''), model: clean(model||'') },
      parsed: { family: fam },
      plate: { guidance: plateTips },
      modelNotes: notesByModel,
      serialRanges: ranges,
      notes
    });
  } catch(e:any){
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
