import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

const supabase = () => supabaseService();

function clean(s:string){ return (s||"").trim().toUpperCase(); }

function familyFromModel(model:string|null){
  const s = clean(model || "");
  // quick cues — we also rely on DB seeds for richer mapping
  if(/RT\b/.test(s) || /\bRT\b/.test(s)) return "Rough-Terrain Scissor";
  if(/^SJ\d{2}\s?E$/.test(s) || /^SJ(12|16|20)\b/.test(s)) return "Vertical Mast";
  if(/AJ\b/.test(s)) return "Articulating Boom";
  if(/\bT\b/.test(s)) return "Telescopic Boom";
  if(/^SJ(3|4|46|47)/.test(s) || /SJIII/.test(s)) return "Scissor Lift";
  return null;
}

export async function POST(req: Request){
  try{
    const { serial, model } = await req.json();
    if(!serial) return NextResponse.json({ error: "Missing serial/PIN" }, { status: 400 });

    const db = supabase();
    const normalized = clean(serial);
    const fam = familyFromModel(model);

    // Plate guidance
    let plateTips:any[] = [];
    if(fam){
      const { data } = await db.from("skyjack_plate_locations")
        .select("equipment_type,series,location_notes")
        .eq("equipment_type", fam);
      plateTips = data || [];
    } else {
      const { data } = await db.from("skyjack_plate_locations")
        .select("equipment_type,series,location_notes").limit(6);
      plateTips = data || [];
    }

    // Serial ranges for this model (if provided)
    let ranges:any[] = [];
    if(model){
      const { data } = await db.from("skyjack_model_serial_ranges")
        .select("model_code,serial_range,notes")
        .ilike("model_code", `%${model}%`);
      ranges = data || [];
    }

    const notes:string[] = [];
    notes.push("Use the serial number nameplate on the machine to record the full serial exactly as shown.");
    notes.push("Skyjack publishes manuals/parts by serial range; match your serial to the correct document when ordering parts or servicing.");
    if(fam === "Scissor Lift") notes.push("On compact/conventional scissors, the plate is typically at the rear side of the MEWP.");
    if(fam === "Rough-Terrain Scissor") notes.push("On RT scissors, the plate is typically mounted on the side of the MEWP.");
    if(fam === "Articulating Boom" || fam === "Telescopic Boom") notes.push("On booms, the plate is typically at the rear/turret area of the MEWP.");

    return NextResponse.json({
      input: { serial: normalized, model: model || null },
      parsed: { family: fam },
      plate: { guidance: plateTips },
      serialRanges: ranges,
      notes
    });
  } catch (e:any){
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
