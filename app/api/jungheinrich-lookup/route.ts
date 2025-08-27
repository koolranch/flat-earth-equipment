import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service.server";

const supabase = () => supabaseService();

function clean(s:string){ return (s||"").trim().toUpperCase(); }

function familyFromModel(model:string|null){
  const s = clean(model || "");
  if(/^EFG/.test(s)) return "Electric Counterbalance";
  if(/^DFG|^TFG/.test(s)) return "IC Counterbalance";
  if(/^ETVQ/.test(s)) return "Four-Way Reach";
  if(/^ETV|^ETM/.test(s)) return "Reach Truck";
  if(/^EJE/.test(s)) return "Pallet Truck";
  if(/^EJC|^EJD|^ERC/.test(s)) return "Stacker";
  if(/^EKS/.test(s)) return "Order Picker";
  if(/^EKX/.test(s)) return "VNA (Turret)";
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
      const { data } = await db.from("jh_plate_locations")
        .select("equipment_type,series,location_notes")
        .eq("equipment_type", fam);
      plateTips = data || [];
    } else {
      const { data } = await db.from("jh_plate_locations")
        .select("equipment_type,series,location_notes").limit(8);
      plateTips = data || [];
    }

    // Model serial-related notes
    let notesByModel:any[] = [];
    if(model){
      const { data } = await db.from("jh_model_serial_notes")
        .select("model_code,note").ilike("model_code", `%${model}%`);
      notesByModel = data || [];
    }

    const notes:string[] = [];
    notes.push("Use the truck data/identification plate and record the full truck serial exactly as shown.");
    notes.push("Jungheinrich manuals and parts systems are organized by model and serial—match your serial when selecting documents or ordering parts.");
    if(fam === "Reach Truck") notes.push("Reach truck manuals show the serial engraved on the chassis.");
    if(fam === "Order Picker") notes.push("On some EKS models the serial is engraved on the chassis under the battery cover.");

    return NextResponse.json({
      input: { serial: normalized, model: model || null },
      parsed: { family: fam },
      plate: { guidance: plateTips },
      modelNotes: notesByModel,
      notes
    });
  } catch (e:any){
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
