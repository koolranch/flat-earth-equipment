import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

const supabase = () => supabaseService();

function clean(s: string) { return (s || '').trim(); }
function up(s: string) { return clean(s).toUpperCase(); }

function familyFromPrefix(model?: string | null): string | null {
  const m = up(model || '');
  if (m.startsWith('MT')) return 'MT';
  if (m.startsWith('MLT')) return 'MLT';
  if (m.startsWith('MRT')) return 'MRT';
  if (m.startsWith('MI')) return 'MI';
  if (m.startsWith('ME')) return 'ME';
  if (m.startsWith('MC')) return 'MC';
  if (m.startsWith('MSI')) return 'MSI';
  return null;
}

export async function POST(req: Request) {
  try {
    const { model, serial } = await req.json();
    if (!serial && !model) {
      return NextResponse.json({ error: 'Provide at least a serial/PIN or a model.' }, { status: 400 });
    }

    const db = supabase();

    // Try alias normalization
    let normalizedModel: string | null = null;
    let family: string | null = null;

    if (model) {
      const alias = up(model);
      const { data: hit } = await db
        .from('manitou_model_aliases')
        .select('normalized,family')
        .eq('alias', alias)
        .maybeSingle();

      if (hit) {
        normalizedModel = hit.normalized;
        family = hit.family;
      } else {
        family = familyFromPrefix(model);
        normalizedModel = model;
      }
    }

    if (!family) family = familyFromPrefix(serial);

    // Plate guidance
    let plateHelp: any[] = [];
    if (family) {
      const { data } = await db
        .from('manitou_plate_locations')
        .select('family,component,location_note')
        .eq('family', family);
      plateHelp = data || [];
    } else {
      const { data } = await db
        .from('manitou_plate_locations')
        .select('family,component,location_note')
        .limit(8);
      plateHelp = data || [];
    }

    // Disclaimer by family
    let disclaimer = "Use the Manufacturer's plate and record the full Serial Number / Product Identification Number. Manitou does not publish a universal year-decoder; match serial when seeking parts/service.";
    if (family) {
      const { data: row } = await db
        .from('manitou_serial_lookup')
        .select('disclaimer')
        .eq('family', family)
        .maybeSingle();
      if (row?.disclaimer) disclaimer = row.disclaimer;
    }

    const notes: string[] = [
      "Find the Manufacturer's plate on the machine; record the Serial Number / Product Identification Number exactly as shown.",
      "Serial/PIN may also be stamped on the chassis/frame; component plates exist on engine, pump/motor, axles and cab.",
      "Provide the full serial when requesting information or ordering parts."
    ];

    return NextResponse.json({
      input: { serial: serial ? clean(serial) : null, model: model ? clean(model) : null },
      match: { normalizedModel, family },
      plateHelp,
      disclaimer,
      notes
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
