import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function clean(input: string) {
  return (input || "").trim().toUpperCase();
}

const PREFIXES = ["FG", "FD", "FB"];

async function decodeVinYear(serial: string) {
  const vin = serial.replace(/[^A-Z0-9]/g, "").toUpperCase();
  if (vin.length !== 17) return null;
  
  const code = vin[9];
  const admin = supabaseAdmin();
  
  const { data, error } = await admin
    .from("komatsu_vin_year_map")
    .select("year")
    .eq("code", code)
    .maybeSingle();
    
  if (error) {
    console.error("VIN year lookup error:", error);
    return null;
  }
  
  return data?.year || null;
}

// Very light IC model-code helper (FG/FD only)
async function decodeIcModel(model: string | undefined) {
  if (!model) return null;
  
  const admin = supabaseAdmin();
  const s = clean(model);
  const match = s.match(/\b(FG|FD)\s*([0-9]{2})([A-Z]{0,2})/);
  if (!match) return null;
  
  const [, fuel, capacity, design] = match;
  const result: any = { 
    fuel, 
    capacity_lbs: null, 
    designations: [] as string[] 
  };

  // Capacity (position 2)
  const { data: capData, error: capError } = await admin
    .from("komatsu_ic_model_code_key")
    .select("code,meaning")
    .eq("position", 2)
    .eq("code", capacity)
    .maybeSingle();
    
  if (capError) {
    console.error("Capacity lookup error:", capError);
  } else if (capData) {
    result.capacity_lbs = capData.meaning;
  }

  // Design codes (position 3 or 4)
  if (design) {
    for (const ch of design.match(/.{1,2}/g) || []) {
      const { data, error } = await admin
        .from("komatsu_ic_model_code_key")
        .select("meaning")
        .eq("code", ch)
        .or(`position.eq.3,position.eq.4`);
        
      if (error) {
        console.error("Design code lookup error:", error);
      } else if (data?.[0]?.meaning) {
        result.designations.push(data[0].meaning);
      }
    }
  }

  // Fuel meaning (position 1)
  const { data: fuelData, error: fuelError } = await admin
    .from("komatsu_ic_model_code_key")
    .select("meaning")
    .eq("position", 1)
    .eq("code", fuel)
    .maybeSingle();
    
  if (fuelError) {
    console.error("Fuel lookup error:", fuelError);
  } else if (fuelData) {
    result.fuel_meaning = fuelData.meaning;
  }

  return result;
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

    const admin = supabaseAdmin();
    const normalized = clean(serial);
    const vinYear = await decodeVinYear(normalized);

    // Infer family from prefix (serial or model text)
    const combinedText = clean([model, serial].filter(Boolean).join(" "));
    const prefix = PREFIXES.find(p => combinedText.startsWith(p)) || null;

    // Plate tips: explicit type > inferred family > defaults
    let type = equipmentType || null;
    if (!type && prefix) {
      const { data: prefixData, error: prefixError } = await admin
        .from("komatsu_model_prefixes")
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
        .from("komatsu_plate_locations")
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
        .from("komatsu_plate_locations")
        .select("equipment_type,series,location_notes")
        .limit(5);
        
      if (error) {
        console.error("Fallback plate locations query error:", error);
      } else {
        plateTips = (data || []) as PlateLocation[];
      }
    }

    // IC model decode (optional)
    const icDecode = await decodeIcModel(model);

    const notes: string[] = [];
    if (vinYear) {
      notes.push("Detected a 17-character VIN/PIN; year decoded from the 10th character.");
    }
    notes.push("Komatsu trucks usually don't encode year in the short serial; use the data plate or contact a dealer for exact year.");
    notes.push("If the plate is missing/illegible, check the embossed serial on the left front fender (IC) or the frame/battery area (FB).");

    return NextResponse.json({
      input: { 
        serial: normalized, 
        model: model || null, 
        equipmentType: equipmentType || null 
      },
      parsed: { 
        inferredPrefix: prefix, 
        vinYear 
      },
      modelDecode: icDecode,
      plate: { 
        guidance: plateTips 
      },
      notes,
      helpfulLinks: [
        // Keep official-only links if you decide to render them
        { label: "My Komatsu (official parts portal)", href: "https://mykomatsu.komatsu/" }
      ]
    });
    
  } catch (e: any) {
    console.error("Komatsu lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
