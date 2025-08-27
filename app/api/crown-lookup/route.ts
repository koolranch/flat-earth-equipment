export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

function clean(input: string) {
  return (input || "").trim().toUpperCase();
}

// Prefer 2-char prefixes first (TSP, etc.)
const PREFIXES = ["C5", "FC", "SC", "RC", "RR", "RD", "RM", "SP", "TSP", "WP", "PE", "PC", "WT", "ST", "SX", "TR", "TC"];

function inferPrefixFromText(input: string) {
  const s = clean(input);
  
  // Direct prefix match
  for (const p of PREFIXES) { 
    if (s.startsWith(p)) return p; 
  }
  
  // Look inside text (e.g., "RR 5700" or "FC5200")
  const match = s.match(/\b(C5|FC|SC|RC|RR|RD|RM|SP|TSP|WP|PE|PC|WT|ST|SX|TR|TC)\s*\d*/i);
  return match ? match[1].toUpperCase() : null;
}

async function lookupVinYear(serial: string) {
  // VIN rules: exactly 17 alphanumeric chars
  const vin = serial.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (vin.length !== 17) return null;
  
  const tenth = vin[9];
  const admin = supabaseService();
  
  const { data, error } = await admin
    .from("crown_vin_year_map")
    .select("year")
    .eq("code", tenth)
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
    const equipmentType: string | undefined = body?.equipmentType;

    if (!serial) {
      return NextResponse.json({ error: "Missing serial/PIN" }, { status: 400 });
    }

    const admin = supabaseService();
    const normalized = clean(serial);
    const prefix = inferPrefixFromText(normalized);

    // VIN-year only when a true 17-char VIN/PIN is supplied
    const vinYear = await lookupVinYear(normalized);

    // Plate tips: by explicitly chosen type or inferred family
    let type = equipmentType || null;
    if (!type && prefix) {
      const { data: prefixData, error: prefixError } = await admin
        .from("crown_model_prefixes")
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
        .from("crown_plate_locations")
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
        .from("crown_plate_locations")
        .select("equipment_type,series,location_notes")
        .limit(6);
        
      if (error) {
        console.error("Fallback plate locations query error:", error);
      } else {
        plateTips = (data || []) as PlateLocation[];
      }
    }

    // Serial pattern helper text
    const isSeventeen = /^[A-Z0-9]{17}$/.test(normalized);
    const serialNote = isSeventeen
      ? "Detected 17-character VIN/PIN. Year decoded from the 10th character when applicable."
      : "For non-VIN serials, reference the capacity/data plate (many Crown trucks list serial there). If the plate is missing, check frame/mast stamp or contact a Crown dealer.";

    return NextResponse.json({
      input: { 
        serial: normalized, 
        equipmentType: equipmentType || null 
      },
      parsed: { 
        inferredPrefix: prefix || null, 
        vinYear: vinYear || null 
      },
      plate: { 
        guidance: plateTips 
      },
      notes: [
        serialNote,
        "Always rely on the data plate for exact details; Crown parts & service requests are serial-driven."
      ]
    });
    
  } catch (e: any) {
    console.error("Crown lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
