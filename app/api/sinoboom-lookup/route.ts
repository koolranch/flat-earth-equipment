import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service.server";

const supabase = () => supabaseService();

function clean(s: string) { 
  return (s || "").trim().toUpperCase(); 
}

// Longest-first to avoid partials
const CUES = [
  "TB28J PLUS", "TB20J PLUS", "TB18 PLUS",
  "AB22EJ PLUS", "AB18EJ PLUS", "AB16EJ PLUS",
  "4047E", "3346E", "2746E", "2146E",
  "1932ME", "1532ME", "1930SE", "1530SE", "0608SE", "0408SE", "0608ME", "0408ME"
];

function inferCue(input: string) {
  const s = clean(input);
  
  // Try direct prefix match first
  for (const c of CUES) { 
    if (s.startsWith(c)) return c; 
  }
  
  // Try regex word boundary match
  const re = new RegExp("\\b(" + CUES.map(c => c.replace(/[+]/g, "\\+")).join("|") + ")\\b", "i");
  const m = s.match(re); 
  return m ? m[1].toUpperCase() : null;
}

export async function POST(req: Request) {
  try {
    const { serial, model } = await req.json();
    if (!serial) {
      return NextResponse.json({ error: "Missing serial" }, { status: 400 });
    }

    const db = supabase();
    const normalized = clean(serial);
    const txt = clean([model, serial].filter(Boolean).join(" "));
    const cue = inferCue(txt);

    // Resolve family from cue
    let family: string | null = null;
    if (cue) {
      const { data } = await db
        .from("sinoboom_model_cues")
        .select("family")
        .eq("cue", cue);
      family = data?.[0]?.family || null;
    }

    // Plate guidance
    let plateTips: any[] = [];
    if (family) {
      const { data } = await db
        .from("sinoboom_plate_locations")
        .select("equipment_type,series,location_notes")
        .eq("equipment_type", family);
      plateTips = data || [];
    } else {
      // Show general guidance if no specific family found
      const { data } = await db
        .from("sinoboom_plate_locations")
        .select("equipment_type,series,location_notes")
        .limit(6);
      plateTips = data || [];
    }

    // Known serial ranges for exact model
    let ranges: any[] = [];
    if (cue) {
      const { data } = await db
        .from("sinoboom_model_serial_ranges")
        .select("model_code,serial_range,notes")
        .eq("model_code", cue);
      ranges = data || [];
    }

    const notes: string[] = [];
    notes.push("Use the machine nameplate to read the exact model and serial. See the Decals/Nameplates section in the operation manual.");
    notes.push("Sinoboom does not publish a universal year-from-serial method; avoid inferring model year from the serial.");
    
    if (family === "Telescopic Boom" || family === "Articulated Boom") {
      notes.push("Boom manuals show a 'Diagram of Decals Positions' indicating the nameplate location.");
    }
    
    if (ranges.length) {
      notes.push("This model has published serial-range blocks; the results below reflect those ranges.");
    }

    return NextResponse.json({
      input: { serial: normalized, model: model || null },
      parsed: { inferredCue: cue, family: family || null },
      plate: { guidance: plateTips },
      serialRanges: ranges,
      notes
    });

  } catch (e: any) {
    console.error("Sinoboom lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
