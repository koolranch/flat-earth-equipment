import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

const supabase = () => supabaseService();

function clean(s: string) { 
  return (s || "").trim().toUpperCase(); 
}

const CUES = [
  "TXL 2000",
  "TX 1000", "TX 525", "TX 427",
  "E-DINGO 500", "323",
  "MB TX 2500S", "MB TX 2500", "MB-1600"
];

function inferCue(input: string) {
  const s = clean(input);
  for (const c of CUES) { 
    if (s.startsWith(c)) return c; 
  }
  const re = /\b(TXL 2000|TX 1000|TX 525|TX 427|E-DINGO 500|323|MB TX 2500S|MB TX 2500|MB-1600)\b/i;
  const m = s.match(re); 
  return m ? m[1].toUpperCase() : null;
}

// Try to extract a numeric model number for serial-range lookup (e.g., 22218)
function extractModelNumber(input?: string | null) {
  if (!input) return null;
  const m = (input.match(/\b(\d{4,6})\b/) || [])[1];
  return m || null;
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
      const { data: map } = await db.from("toro_model_cues").select("family").eq("cue", cue);
      family = map?.[0]?.family || null;
    }

    // Plate guidance
    let plateTips: any[] = [];
    if (family) {
      const { data } = await db.from("toro_plate_locations")
        .select("equipment_type,series,location_notes")
        .ilike("equipment_type", `%${family}%`);
      plateTips = data || [];
    } else {
      const { data } = await db.from("toro_plate_locations")
        .select("equipment_type,series,location_notes").limit(6);
      plateTips = data || [];
    }

    // Known serial-range blocks (e.g., e-Dingo model 22218)
    const modelNumber = extractModelNumber(model || "");
    let ranges: any[] = [];
    if (modelNumber) {
      const { data } = await db.from("toro_model_serial_ranges")
        .select("model_number,serial_range,notes").eq("model_number", modelNumber);
      ranges = data || [];
    }

    const notes: string[] = [];
    notes.push("Toro does not publish a universal year-from-serial method for these machines; use the model/serial plate and any on-machine InfoCenter.");
    if (cue === "TXL 2000") {
      notes.push("On TXL 2000, the InfoCenter 'About' screen lists the Model and Serial.");
    }
    if (ranges.length) {
      notes.push("The ranges shown mirror Toro parts page serial blocks for that model.");
    }
    notes.push("Many newer decals include a QR code for parts/warranty lookup.");

    return NextResponse.json({
      input: { serial: normalized, model: model || null, equipmentType: equipmentType || null },
      parsed: { inferredCue: cue, family: family || null, modelNumber: modelNumber || null },
      plate: { guidance: plateTips },
      serialRanges: ranges,
      notes
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
