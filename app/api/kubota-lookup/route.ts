import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service.server";

const supabase = () => supabaseService();

function clean(s: string) { 
  return (s || "").trim().toUpperCase(); 
}

function familyFromModel(model: string | null) {
  const s = clean(model || "");
  if (/^SVL/.test(s)) return "Compact Track Loader";
  if (/^SSV/.test(s)) return "Skid Steer Loader";
  if (/^KX/.test(s)) return "Compact Excavator";
  if (/^U/.test(s)) return "Compact Excavator";
  if (/^R/.test(s)) return "Wheel Loader";
  if (/^(L47|M62)/.test(s)) return "Tractor Loader Backhoe";
  return null;
}

export async function POST(req: Request) {
  try {
    const { serial, model } = await req.json();
    if (!serial) {
      return NextResponse.json({ error: "Missing serial/PIN" }, { status: 400 });
    }

    const db = supabase();
    const normalized = clean(serial);
    const fam = familyFromModel(model);

    // Plate guidance.
    // When a model is provided, surface model-specific plates first (longer
    // and more specific `series` strings), then fall back to family-level
    // entries so the visitor still sees the canonical "where to look" note.
    let plateTips: any[] = [];
    if (fam) {
      const { data } = await db
        .from("kubota_plate_locations")
        .select("equipment_type,series,location_notes")
        .eq("equipment_type", fam);
      plateTips = data || [];
    } else {
      const { data } = await db
        .from("kubota_plate_locations")
        .select("equipment_type,series,location_notes")
        .limit(6);
      plateTips = data || [];
    }

    if (model) {
      const m = clean(model);
      const isModelSpecific = (s: string | null) =>
        !!s && m.length > 0 && s.toUpperCase().includes(m);
      const isFamily = (s: string | null) =>
        !!s && /-series$/i.test(s);
      plateTips = plateTips
        .map((row, idx) => ({
          row,
          idx,
          score: (isModelSpecific(row.series) ? 0 : 1) + (isFamily(row.series) ? 0.5 : 0)
        }))
        .sort((a, b) => a.score - b.score || a.idx - b.idx)
        .map(({ row }) => row);
    }

    // Known serial breaks for the model (if provided).
    let ranges: any[] = [];
    if (model) {
      const { data } = await db
        .from("kubota_model_serial_ranges")
        .select("model_code,serial_range,notes")
        .ilike("model_code", `%${model}%`);
      ranges = data || [];
    }

    const notes: string[] = [];
    notes.push("Use the machine data tag / nameplate to read the full Product Identification Number (PIN), and record the engine serial from the engine plate.");
    notes.push("Kubota uses serial-number breaks in parts books; do not attempt a universal year-from-serial decode.");
    if (model && ranges.length === 0) {
      notes.push(`No published parts-book serial breaks were found for ${clean(model)}. Read the chassis data tag for the PIN and the engine plate for the engine serial — that is what the dealer uses for parts.`);
    }
    
    if (fam === "Compact Track Loader") {
      notes.push("SVL plate is typically at left-front outside the cab, just below the door sill.");
    }
    if (fam === "Compact Excavator") {
      notes.push("KX/U excavators: data tag is on the front of the upper structure.");
    }
    if (fam === "Wheel Loader") {
      notes.push("R-series wheel loaders: data tag is on the right side of the front frame.");
    }
    if (fam === "Tractor Loader Backhoe") {
      notes.push("TLB models: data tag is on the left side of the main frame.");
    }

    return NextResponse.json({
      input: { serial: normalized, model: model || null },
      parsed: { family: fam },
      plate: { guidance: plateTips },
      serialRanges: ranges,
      notes
    });

  } catch (e: any) {
    console.error("Kubota lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
