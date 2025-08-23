import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function clean(s:string){ return (s||"").trim().toUpperCase(); }

// longest-first so BXC matches before BX
const PREFIXES = ["BXC","SRX","SCX","AF","PF","CF","BX","TX"];

function inferPrefix(input:string){
  const s = clean(input);
  for(const p of PREFIXES){ if(s.startsWith(p)) return p; }
  const m = s.match(/\b(BXC|SRX|SCX|AF|PF|CF|BX|TX)\s*\d*/i);
  return m ? m[1].toUpperCase() : null;
}

async function vinYear(db:any, serial:string){
  const vin = serial.replace(/[^A-Z0-9]/g,"").toUpperCase();
  if(vin.length !== 17) return null;
  const code = vin[9];
  const { data } = await db.from("uc_vin_year_map").select("year").eq("code", code);
  return data?.[0]?.year || null;
}

async function capacityMeaning(db:any, model?:string){
  if(!model) return null;
  const m = clean(model).match(/\b([0-9]{2})[A-Z]?/); // e.g., AF50, CF100, BXC30N
  if(!m) return null;
  const two = m[1].slice(-2); // normalize 100 -> "00" won't match; favor 2-digit codes
  const { data } = await db.from("uc_capacity_map").select("approx_capacity").eq("code", two);
  return data?.[0]?.approx_capacity || null;
}

export async function POST(req: Request){
  try{
    const { serial, model, equipmentType } = await req.json();
    if(!serial) return NextResponse.json({ error: "Missing serial/PIN" }, { status: 400 });

    const db = supabase();
    const normalized = clean(serial);

    const decodedYear = await vinYear(db, normalized);

    // infer family from provided type or prefix in model/serial
    const txt = clean([model, serial].filter(Boolean).join(" "));
    const prefix = PREFIXES.find(p => txt.startsWith(p)) || inferPrefix(txt) || null;

    let type = equipmentType || null;
    if(!type && prefix){
      const { data: map } = await db.from("uc_model_prefixes").select("*").eq("prefix", prefix);
      type = map?.[0]?.family || null;
    }

    // plate guidance
    let plateTips:any[] = [];
    if(type){
      const { data } = await db.from("uc_plate_locations")
        .select("equipment_type,series,location_notes")
        .ilike("equipment_type", `%${type}%`);
      plateTips = data || [];
    } else {
      const { data } = await db.from("uc_plate_locations")
        .select("equipment_type,series,location_notes").limit(5);
      plateTips = data || [];
    }

    // series advisory
    const { data: series } = await db.from("uc_series_examples").select("*").limit(5);
    const cap = await capacityMeaning(db, model || undefined);

    const notes:string[] = [];
    if(decodedYear) notes.push("Detected a 17-character VIN/PIN; year decoded from the 10th character.");
    notes.push("UniCarriers (Nissan/TCM lineage) serials typically do not encode year in a universal way. Use the Name/Capacity plate or contact an authorized dealer to confirm.");
    notes.push("For many UniCarriers 1F1/1F2 series trucks, the chassis serial is stamped on the front panel.");

    return NextResponse.json({
      input: { serial: normalized, model: model || null, equipmentType: equipmentType || null },
      parsed: { inferredPrefix: prefix, vinYear: decodedYear ?? null, approxCapacity: cap },
      plate: { guidance: plateTips },
      seriesExamples: series || [],
      notes
    });
  } catch (e:any){
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
