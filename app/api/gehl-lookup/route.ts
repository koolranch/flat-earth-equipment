import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

const supabase = () => supabaseService();

function clean(s:string){ return (s||"").trim().toUpperCase(); }

function familyFromModel(model:string|null){
  const s = clean(model || "");
  if(/^R\d+/.test(s) && !/RT/.test(s)) return "Skid Steer"; // R135, R190, etc but not RT
  if(/^V\d+/.test(s)) return "Skid Steer"; // V270, V330
  if(/^RT/.test(s)) return "Track Loader"; // RT175, RT210, etc
  if(/^RS/.test(s)) return "Telehandler"; // RS6-42, RS6-34
  if(/^AL/.test(s)) return "Articulated Loader"; // AL650
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
      const { data } = await db.from("gehl_plate_locations")
        .select("equipment_type,series,location_notes")
        .eq("equipment_type", fam);
      plateTips = data || [];
    } else {
      const { data } = await db.from("gehl_plate_locations")
        .select("equipment_type,series,location_notes").limit(6);
      plateTips = data || [];
    }

    // Serial ranges for this model (if provided)
    let ranges:any[] = [];
    if(model){
      const { data } = await db.from("gehl_model_serial_ranges")
        .select("model_code,serial_range,notes")
        .ilike("model_code", `%${model}%`);
      ranges = data || [];
    }

    // Model serial-related notes
    let notesByModel:any[] = [];
    if(model){
      const { data } = await db.from("gehl_model_serial_notes")
        .select("model_code,note").ilike("model_code", `%${model}%`);
      notesByModel = data || [];
    }

    const notes:string[] = [];
    notes.push("Use the machine's Product/ID plate and record the Product Identification Number (PIN) exactly as shown.");
    notes.push("Gehl parts/manuals are organized by model and serial—match your PIN when selecting documents or ordering parts.");
    if(fam === "Skid Steer") notes.push("On skid steers (R/V), the model & serial decal is commonly on the left chassis upright.");
    if(fam === "Track Loader" || fam === "Telehandler") notes.push("Track loaders (RT) and telehandlers (RS) use product plates and stamped serials as documented in their manuals.");

    return NextResponse.json({
      input: { serial: normalized, model: model || null },
      parsed: { family: fam },
      plate: { guidance: plateTips },
      serialRanges: ranges,
      modelNotes: notesByModel,
      notes
    });
  } catch (e:any){
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
