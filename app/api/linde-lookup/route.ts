import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service.server";

const supabase = () => supabaseService();

function clean(s: string) { 
  return (s || "").trim().toUpperCase(); 
}

function familyFromModel(model: string | null) {
  const s = clean(model || "");
  if (/^X/.test(s) || /^E/.test(s)) return "Electric Counterbalance";
  if (/^H/.test(s)) return "IC Counterbalance";
  if (/^R/.test(s)) return "Reach Truck";
  if (/^L/.test(s)) return "Pallet Stacker";
  if (/^V/.test(s)) return "Order Picker";
  return null;
}

export async function POST(req: Request) {
  try {
    const { serial, model } = await req.json();
    if (!serial) {
      return NextResponse.json({ error: "Missing serial" }, { status: 400 });
    }

    const db = supabase();
    const normalized = clean(serial);
    const fam = familyFromModel(model);

    // Plate guidance
    let plateTips: any[] = [];
    if (fam) {
      const { data } = await db
        .from("linde_plate_locations")
        .select("equipment_type,series,location_notes")
        .eq("equipment_type", fam);
      plateTips = data || [];
    } else {
      const { data } = await db
        .from("linde_plate_locations")
        .select("equipment_type,series,location_notes")
        .limit(6);
      plateTips = data || [];
    }

    // Model serial-related notes (if provided)
    let notesByModel: any[] = [];
    if (model) {
      const { data } = await db
        .from("linde_model_serial_notes")
        .select("model_code,note")
        .ilike("model_code", `%${model}%`);
      notesByModel = data || [];
    }

    const notes: string[] = [];
    notes.push("Use the truck data/identification plate on the body/frame; record the full serial exactly as shown.");
    notes.push("Linde does not publish a universal year-from-serial method. Avoid inferring model year from the serial.");
    
    if (fam === "Electric Counterbalance" || fam === "IC Counterbalance") {
      notes.push("Common plate locations include near the mast, on/near the counterweight, or in the operator compartment.");
    }
    if (fam === "Reach Truck") {
      notes.push("Reach trucks often mount the identification plate on or near the overhead guard in the operator area.");
    }

    return NextResponse.json({
      input: { serial: normalized, model: model || null },
      parsed: { family: fam },
      plate: { guidance: plateTips },
      modelNotes: notesByModel,
      notes
    });

  } catch (e: any) {
    console.error("Linde lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
