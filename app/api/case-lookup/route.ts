import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

const supabase = () => supabaseService();

function clean(s: string) { 
  return (s || "").trim().toUpperCase(); 
}

// order matters: longest-first (e.g., 580SN WT before 580N; numeric loaders before CX)
const CUES = [
  "580SN WT", "590SN", "580N",
  "CX210D", "CX145D", "CX",
  "1121G", "1021G", "921G", "821G", "721G", "621G", "521G",
  "2050M", "1650M", "1150M", "850M", "750M", "650M",
  "CX60C", "CX57C", "CX37C", "CX26C", "CX17C",
  "TV", "TR", "SV", "SR"
];

function inferCue(input: string) {
  const s = clean(input);
  for (const c of CUES) { 
    if (s.startsWith(c)) return c; 
  }
  const re = /\b(580SN WT|590SN|580N|CX210D|CX145D|CX|1121G|1021G|921G|821G|721G|621G|521G|2050M|1650M|1150M|850M|750M|650M|CX60C|CX57C|CX37C|CX26C|CX17C|TV|TR|SV|SR)\b/i;
  const m = s.match(re); 
  return m ? m[1].toUpperCase() : null;
}

async function vinYear(db: any, serial: string) {
  const pin = serial.replace(/[^A-Z0-9]/g, "").toUpperCase();
  if (pin.length !== 17) return null;
  const code = pin[9];
  const { data } = await db.from("case_vin_year_map").select("year").eq("code", code);
  return data?.[0]?.year || null;
}

export async function POST(req: Request) {
  try {
    const { serial, model, equipmentType } = await req.json();
    if (!serial) return NextResponse.json({ error: "Missing serial/PIN" }, { status: 400 });

    const db = supabase();
    const normalized = clean(serial);
    const txt = clean([model, serial].filter(Boolean).join(" "));
    const cue = inferCue(txt);

    // Resolve family from explicit type or cue
    let family = equipmentType || null;
    if (!family && cue) {
      const { data: map } = await db.from("case_model_cues").select("family").eq("cue", cue);
      family = map?.[0]?.family || null;
    }

    // Plate guidance
    let plateTips: any[] = [];
    if (family) {
      const { data } = await db.from("case_plate_locations")
        .select("equipment_type,series,location_notes")
        .ilike("equipment_type", `%${family}%`);
      plateTips = data || [];
    } else {
      const { data } = await db.from("case_plate_locations")
        .select("equipment_type,series,location_notes").limit(6);
      plateTips = data || [];
    }

    // Series notes
    const { data: series } = await db.from("case_series_examples").select("*").limit(6);

    // VIN year (true 17-char PIN only)
    const year = await vinYear(db, normalized);

    const notes: string[] = [];
    if (year) notes.push("Detected a true 17-character VIN/PIN; decoded model year from the 10th character.");
    notes.push("CASE serials/PINs typically do not encode year in a single universal way. Use the machine identification plate to confirm details, or contact an authorized CASE dealer.");
    notes.push("Major components (engine, axles, transmission) carry their own ID plates.");

    return NextResponse.json({
      input: { serial: normalized, model: model || null, equipmentType: equipmentType || null },
      parsed: { inferredCue: cue, family: family || null, vinYear: year ?? null },
      plate: { guidance: plateTips },
      seriesExamples: series || [],
      notes
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
