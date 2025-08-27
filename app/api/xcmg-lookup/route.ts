import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

const supabase = () => supabaseService();

function clean(s: string) { 
  return (s || "").trim().toUpperCase(); 
}

const FAMILY_PREFIXES: Array<{re: RegExp, family: string}> = [
  { re: /^XE/, family: "Excavator" },
  { re: /^(XC|ZL)/, family: "Wheel Loader" },
  { re: /^XS/, family: "Roller (Single Drum)" },
  { re: /^XD/, family: "Roller (Tandem)" },
  { re: /^XP/, family: "Roller (Pneumatic)" },
  { re: /^GR/, family: "Motor Grader" },
  { re: /^XG\d/, family: "MEWP (Scissor)" },
  { re: /^XGS/, family: "MEWP (Telescopic)" },
  { re: /^XGA/, family: "MEWP (Articulated)" },
];

async function inferFamilyFromCue(db: any, txt: string) {
  const s = clean(txt);
  // try direct cue match
  let fam = null;
  const { data: cues } = await db.from("xcmg_model_cues").select("family").eq("cue", s);
  if (cues?.[0]?.family) return cues[0].family;
  // try prefix heuristic
  for (const { re, family } of FAMILY_PREFIXES) { 
    if (re.test(s)) { 
      fam = family; 
      break; 
    } 
  }
  return fam;
}

export async function POST(req: Request) {
  try {
    const { serial, model } = await req.json();
    if (!serial) return NextResponse.json({ error: "Missing serial/PIN" }, { status: 400 });
    const db = supabase();

    const normalized = clean(serial);
    const modelTxt = clean(model || "");
    const family = await inferFamilyFromCue(db, modelTxt);
    const series = family?.includes("MEWP") ? (modelTxt.startsWith("XGS") ? "XGS series" : modelTxt.startsWith("XGA") ? "XGA series" : "XG series") :
                   (modelTxt.startsWith("XE") ? "XE series" :
                    (modelTxt.startsWith("XD") ? "XD series" :
                     (modelTxt.startsWith("XS") ? "XS series" :
                      (modelTxt.startsWith("XP") ? "XP series" :
                       (modelTxt.startsWith("XC") || modelTxt.startsWith("ZL")) ? "XC/ZL series" :
                       (modelTxt.startsWith("GR") ? "GR series" : null)))));

    // fetch plate guidance (by family)
    let plateTips: any[] = [];
    if (family) {
      const { data } = await db.from("xcmg_plate_locations")
        .select("equipment_type,series,location_notes")
        .eq("equipment_type", family);
      plateTips = data || [];
    } else {
      const { data } = await db.from("xcmg_plate_locations")
        .select("equipment_type,series,location_notes")
        .limit(6);
      plateTips = data || [];
    }

    // any known serial ranges for exact model code (rare)
    let ranges: any[] = [];
    if (modelTxt) {
      const { data } = await db.from("xcmg_model_serial_ranges")
        .select("model_code,serial_range,notes").eq("model_code", modelTxt);
      ranges = data || [];
    }

    const notes: string[] = [];
    notes.push("XCMG manuals instruct owners to record the machine PIN/serial and the engine manufacturing/serial number.");
    notes.push("XCMG does not publish a universal year-from-serial decoding for these lines; avoid inferring model year from the PIN.");
    if (family?.startsWith("MEWP")) notes.push("For XCMG MEWPs, use the identification label on the machine as the authoritative serial/PIN for parts & service.");

    return NextResponse.json({
      input: { serial: normalized, model: model || null },
      parsed: { family: family || null, series: series || null },
      plate: { guidance: plateTips },
      serialRanges: ranges,
      notes
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
