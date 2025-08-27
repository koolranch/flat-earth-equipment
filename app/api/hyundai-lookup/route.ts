import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service.server";

const supabase = () => supabaseService();

function clean(s:string){ return (s||"").trim().toUpperCase(); }

function familyFromModel(model:string|null){
  const s = clean(model || "");
  if(/\b(BT|B|BC)-?9/.test(s) || /\b9U\b/.test(s)) return "Electric Counterbalance";
  if(/\bD-?9\b/.test(s)) return "IC Counterbalance";
  if(/\bL-?(7A|9A)\b/.test(s)) return "IC Counterbalance";
  if(/\bBR(J|P)?-?9\b/.test(s) || /\bBR-?X\b/.test(s)) return "Reach Truck";
  if(/\bBOP-?9\b/.test(s)) return "Order Picker";
  if(/\bEPR|EST\b/.test(s)) return "Pallet/Stacker";
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
      const { data } = await db.from("hy_plate_locations")
        .select("equipment_type,series,location_notes")
        .eq("equipment_type", fam);
      plateTips = data || [];
    } else {
      const { data } = await db.from("hy_plate_locations")
        .select("equipment_type,series,location_notes").limit(8);
      plateTips = data || [];
    }

    // Model-level notes
    let notesByModel:any[] = [];
    if(model){
      const { data } = await db.from("hy_model_serial_notes")
        .select("model_code,note").ilike("model_code", `%${model}%`);
      notesByModel = data || [];
    }

    // Serial ranges (if later added)
    let ranges:any[] = [];
    if(model){
      const { data } = await db.from("hy_model_serial_ranges")
        .select("model_code,serial_range,notes").ilike("model_code", `%${model}%`);
      ranges = data || [];
    }

    const notes:string[] = [];
    notes.push("Use the truck data/ID plate and record the full serial exactly as shown.");
    notes.push("Hyundai manuals and parts systems are organized by model and serial—match your serial when selecting documents or ordering parts.");
    if(fam === "IC Counterbalance") notes.push("On many diesel/LPG models, the truck serial is shown on the front of the right-side frame; engine serial is on the engine nameplate.");

    return NextResponse.json({
      input: { serial: normalized, model: model || null },
      parsed: { family: fam },
      plate: { guidance: plateTips },
      modelNotes: notesByModel,
      serialRanges: ranges,
      notes
    });
  } catch (e:any){
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
