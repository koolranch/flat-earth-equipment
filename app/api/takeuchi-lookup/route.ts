import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

const supabase = () => supabaseService();

function clean(s: string) { 
  return (s || "").trim().toUpperCase(); 
}

function familyFromModel(model: string | null) {
  const s = clean(model || "");
  if (/^TL/.test(s)) return "Compact Track Loader";
  if (/^TB/.test(s)) return "Compact Excavator";
  if (/^TW/.test(s)) return "Wheel Loader";
  if (/^TS/.test(s)) return "Skid Steer Loader";
  if (/^TCR/.test(s)) return "Crawler Dumper";
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

    // Plate guidance
    let plateTips: any[] = [];
    if (fam) {
      const { data } = await db
        .from("takeuchi_plate_locations")
        .select("equipment_type,series,location_notes")
        .eq("equipment_type", fam);
      plateTips = data || [];
    } else {
      const { data } = await db
        .from("takeuchi_plate_locations")
        .select("equipment_type,series,location_notes")
        .limit(6);
      plateTips = data || [];
    }

    // Known S/N blocks for exact model text (if provided); also try a sanitized cue (e.g., "TL230 Series 2")
    let ranges: any[] = [];
    if (model) {
      const { data } = await db
        .from("takeuchi_model_serial_ranges")
        .select("model_code,serial_range,notes")
        .ilike("model_code", `%${model}%`);
      ranges = data || [];
    }

    const notes: string[] = [];
    notes.push("Use the machine nameplate (serial/PIN) and record the engine serial from its plate; Takeuchi manuals explicitly instruct recording both.");
    notes.push("Do not attempt universal year-from-serial decoding; it is not published by Takeuchi across models.");
    
    if (fam === "Compact Track Loader") {
      notes.push("Track loader manuals state 'Do not remove the machine name plate' and provide spaces to record machine & engine serials.");
    }

    return NextResponse.json({
      input: { serial: normalized, model: model || null },
      parsed: { family: fam },
      plate: { guidance: plateTips },
      serialRanges: ranges,
      notes
    });

  } catch (e: any) {
    console.error("Takeuchi lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
