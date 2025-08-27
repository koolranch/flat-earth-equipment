import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

const supabase = () => supabaseService();

function clean(s: string) { 
  return (s || "").trim().toUpperCase(); 
}

function familyFromModel(model: string | null) {
  const s = clean(model || "");
  if (/^EFL/.test(s) || /^CPD/.test(s)) return "Counterbalance Forklift";
  if (/^CQ[DE]/.test(s)) return "Reach Truck";
  if (/^EPT/.test(s)) return "Pallet Truck";
  if (/^ESR?/.test(s)) return "Stacker";
  if (/^JX/.test(s)) return "Order Picker";
  if (/^QDD/.test(s)) return "Tow Tractor";
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
        .from("ep_plate_locations")
        .select("equipment_type,series,location_notes")
        .eq("equipment_type", fam);
      plateTips = data || [];
    } else {
      const { data } = await db
        .from("ep_plate_locations")
        .select("equipment_type,series,location_notes")
        .limit(6);
      plateTips = data || [];
    }

    // Model notes (if model provided, surface any serial-related notes)
    let notesByModel: any[] = [];
    if (model) {
      const { data } = await db
        .from("ep_model_serial_notes")
        .select("model_code,note")
        .ilike("model_code", `%${model}%`);
      notesByModel = data || [];
    }

    const notes: string[] = [];
    notes.push("Use the truck data/specification plate and frame marking to record the full serial/PIN exactly as shown.");
    notes.push("EP manuals require quoting the serial number for parts/service; do not attempt a universal year-from-serial decode.");
    
    if (fam === "Reach Truck") {
      notes.push("Reach truck manuals list 'Truck data plate' with Serial no.; quote serial when ordering parts.");
    }
    if (fam === "Pallet Truck") {
      notes.push("After-sales parts workflows require the vehicle body serial number.");
    }
    if (notesByModel.length) {
      notes.push("This model has additional serial-related service/parts notes shown below.");
    }

    return NextResponse.json({
      input: { serial: normalized, model: model || null },
      parsed: { family: fam },
      plate: { guidance: plateTips },
      modelNotes: notesByModel,
      notes
    });

  } catch (e: any) {
    console.error("EP lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
