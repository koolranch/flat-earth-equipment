export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service.server";

function clean(input: string) {
  return (input || "").trim().toUpperCase();
}

const PREFIXES = ["TMX", "ECX", "GEX", "GTX", "EPX", "SRX", "OSX", "OPX", "WP", "WT", "PC", "PE", "ST", "SX", "WSX", "S", "GTS", "C"];

function inferPrefix(input: string) {
  const s = clean(input);
  
  // Direct prefix match
  for (const p of PREFIXES) { 
    if (s.startsWith(p)) return p; 
  }
  
  // Look inside text (e.g., "TMX 20" or "ECX25")
  const match = s.match(/\b(TMX|ECX|GEX|GTX|EPX|SRX|OSX|OPX|WP|WT|PC|PE|ST|SX|WSX|S|GTS|C)\s*\d*/i);
  return match ? match[1].toUpperCase() : null;
}

async function vinYear(serial: string) {
  // VIN rules: exactly 17 alphanumeric chars
  const vin = serial.replace(/[^A-Z0-9]/g, "").toUpperCase();
  if (vin.length !== 17) return null;
  
  const code = vin[9];
  const admin = supabaseService();
  
  const { data, error } = await admin
    .from("clark_vin_year_map")
    .select("year")
    .eq("code", code)
    .maybeSingle();
    
  if (error) {
    console.error("VIN year lookup error:", error);
    return null;
  }
  
  return data?.year || null;
}

// Legacy CLARK decoding — ONLY for Carloader-era patterns
// Pattern 1 (1931–1948): model letters + two-digit year immediately after model (e.g., "CL 40 xxxx")
// Pattern 2 (1949–1957): later in the serial two letters: first=year, second=month (C/L/A/R/K/E/Q/U/I/P/M/T)
async function legacyYear(serial: string) {
  const s = clean(serial).replace(/\s+/g, " ");
  const admin = supabaseService();
  
  // Pattern 1: two-digit year directly following "CL" (or other early model code)
  const m1 = s.match(/\bCL\s*([0-9]{2})\b/);
  if (m1) {
    const yy = parseInt(m1[1], 10);
    if (yy >= 31 && yy <= 48) { 
      return 1900 + yy; // 1931–1948
    }
  }
  
  // Pattern 2: year+month letter pair later in string (e.g., "... RQ ...")
  const m2 = s.match(/\b([A-Z])([A-Z])\d*\b/);
  if (m2) {
    const yearCode = m2[1];
    const monthCode = m2[2];
    
    const { data: ymap, error: yError } = await admin
      .from("clark_legacy_year_map")
      .select("year")
      .eq("code", yearCode)
      .maybeSingle();
      
    const { data: mmap, error: mError } = await admin
      .from("clark_legacy_month_map")
      .select("month")
      .eq("code", monthCode)
      .maybeSingle();
      
    if (yError) console.error("Legacy year lookup error:", yError);
    if (mError) console.error("Legacy month lookup error:", mError);
    
    if (ymap?.year && mmap?.month) {
      return ymap.year; // return year; month is advisory
    }
  }
  
  return null;
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
    const prefix = inferPrefix(model || normalized);

    // Decode year via VIN (17) or legacy patterns; modern serials often not derivable
    const decodedVinYear = await vinYear(normalized);
    const decodedLegacyYear = decodedVinYear ? null : await legacyYear(normalized);

    // Plate tips by chosen type or by inferred family from prefix
    let type = equipmentType || null;
    if (!type && prefix) {
      const { data: prefixData, error: prefixError } = await admin
        .from("clark_model_prefixes")
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
        .from("clark_plate_locations")
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
        .from("clark_plate_locations")
        .select("equipment_type,series,location_notes")
        .limit(6);
        
      if (error) {
        console.error("Fallback plate locations query error:", error);
      } else {
        plateTips = (data || []) as PlateLocation[];
      }
    }

    const notes: string[] = [];
    if (decodedVinYear) {
      notes.push("Detected a 17-character VIN/PIN; year decoded from the 10th character.");
    }
    if (decodedLegacyYear) {
      notes.push("Detected a legacy (pre-1958) Clark serial pattern; year decoded accordingly.");
    }
    if (!decodedVinYear && !decodedLegacyYear) {
      notes.push("Modern Clark serials typically don't encode year in a universal way. Use the data plate or contact a Clark dealer to confirm.");
    }
    notes.push("If the plate is missing/illegible, check for a frame/cowl/fender stamp.");

    return NextResponse.json({
      input: { 
        serial: normalized, 
        model: model || null, 
        equipmentType: equipmentType || null 
      },
      parsed: { 
        inferredPrefix: prefix || null, 
        year: decodedVinYear ?? decodedLegacyYear ?? null 
      },
      plate: { 
        guidance: plateTips 
      },
      notes
    });
    
  } catch (e: any) {
    console.error("Clark lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
