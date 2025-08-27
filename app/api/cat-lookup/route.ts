export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

function clean(input: string) {
  return (input || "").trim().toUpperCase();
}

const PREFIXES = ["GP", "DP", "EC", "EP"];

function inferPrefix(input: string) {
  const s = clean(input);
  
  // Direct prefix match
  for (const p of PREFIXES) { 
    if (s.startsWith(p)) return p; 
  }
  
  // Look inside text (e.g., "GP 25N" or "DP40N")
  const match = s.match(/\b(GP|DP|EC|EP)\s*\d*/i);
  return match ? match[1].toUpperCase() : null;
}

async function vinYear(serial: string) {
  // VIN rules: exactly 17 alphanumeric chars
  const vin = serial.replace(/[^A-Z0-9]/g, "").toUpperCase();
  if (vin.length !== 17) return null;
  
  const code = vin[9];
  const admin = supabaseService();
  
  const { data, error } = await admin
    .from("cat_vin_year_map")
    .select("year")
    .eq("code", code)
    .maybeSingle();
    
  if (error) {
    console.error("VIN year lookup error:", error);
    return null;
  }
  
  return data?.year || null;
}

type PlateLocation = {
  equipment_type: string;
  series: string | null;
  location_notes: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serial: string = body?.serial;
    const model: string | undefined = body?.model;
    const equipmentType: string | undefined = body?.equipmentType;

    if (!serial) {
      return NextResponse.json({ error: "Missing serial/PIN" }, { status: 400 });
    }

    const admin = supabaseService();
    const normalized = clean(serial);
    const decodedYear = await vinYear(normalized);

    const prefix = inferPrefix(model || normalized);

    // Plate guidance
    let type = equipmentType || null;
    if (!type && prefix) {
      const { data: prefixData, error: prefixError } = await admin
        .from("cat_model_prefixes")
        .select("family")
        .eq("prefix", prefix)
        .maybeSingle();
        
      if (prefixError) {
        console.error("Prefix lookup error:", prefixError);
      } else {
        type = prefixData?.family || null;
      }
    }

    let plateTips: PlateLocation[] = [];
    if (type) {
      const { data, error } = await admin
        .from("cat_plate_locations")
        .select("equipment_type,series,location_notes")
        .ilike("equipment_type", `%${type}%`);
        
      if (error) {
        console.error("Plate locations query error:", error);
      } else {
        plateTips = (data || []) as PlateLocation[];
      }
    } else {
      // Fallback: show general guidance
      const { data, error } = await admin
        .from("cat_plate_locations")
        .select("equipment_type,series,location_notes")
        .limit(5);
        
      if (error) {
        console.error("Fallback plate locations query error:", error);
      } else {
        plateTips = (data || []) as PlateLocation[];
      }
    }

    const notes: string[] = [];
    if (decodedYear) {
      notes.push("Detected a 17-character VIN/PIN; year decoded from the 10th character.");
    }
    notes.push("Most CAT lift truck serials do not encode year in a universal way. Use the Capacity/Data Plate or contact an authorized CAT dealer for the exact year.");
    notes.push("Record the serial exactly as shown on the Capacity/Data Plate (operator compartment/cowl area).");

    return NextResponse.json({
      input: { 
        serial: normalized, 
        model: model || null, 
        equipmentType: equipmentType || null 
      },
      parsed: { 
        inferredPrefix: prefix || null, 
        year: decodedYear ?? null 
      },
      plate: { 
        guidance: plateTips 
      },
      notes
    });
    
  } catch (e: any) {
    console.error("CAT lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
