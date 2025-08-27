import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

const supabase = () => supabaseService();

function clean(s:string){ return (s||"").trim().toUpperCase(); }

const PREFIXES = ["FGC","FG","FD","FB"]; // order matters (longest first)

function inferPrefix(input:string){
  const s = clean(input);
  for(const p of PREFIXES){ if(s.startsWith(p)) return p; }
  const m = s.match(/\b(FGC|FG|FD|FB)\s*\d*/i);
  return m ? m[1].toUpperCase() : null;
}

async function vinYear(db:any, serial:string){
  const vin = serial.replace(/[^A-Z0-9]/g,"").toUpperCase();
  if(vin.length !== 17) return null;
  const code = vin[9];
  const { data } = await db.from("mitsu_vin_year_map").select("year").eq("code", code);
  return data?.[0]?.year || null;
}

async function capacityMeaning(db:any, model?:string){
  if(!model) return null;
  const m = clean(model).match(/\b([0-9]{2})[A-Z]?N/); // e.g., FG25N, FB30AN
  if(!m) return null;
  const code = m[1];
  const { data } = await db.from("mitsu_capacity_map").select("approx_capacity").eq("code", code);
  return data?.[0]?.approx_capacity || null;
}

export async function POST(req: Request){
  try{
    const { serial, model, equipmentType } = await req.json();
    if(!serial) return NextResponse.json({ error: "Missing serial/PIN" }, { status: 400 });

    const db = supabase();
    const normalized = clean(serial);

    // 17-char VIN/PIN year only
    const decodedYear = await vinYear(db, normalized);

    // infer family from explicit type or prefix (model or serial text)
    const txt = clean([model, serial].filter(Boolean).join(" "));
    const prefix = PREFIXES.find(p => txt.startsWith(p)) || inferPrefix(txt) || null;

    let type = equipmentType || null;
    if(!type && prefix){
      const { data: map } = await db.from("mitsu_model_prefixes").select("*").eq("prefix", prefix);
      type = map?.[0]?.family || null;
    }

    // plate guidance
    let plateTips:any[] = [];
    if(type){
      const { data } = await db.from("mitsu_plate_locations")
        .select("equipment_type,series,location_notes")
        .ilike("equipment_type", `%${type}%`);
      plateTips = data || [];
    } else {
      const { data } = await db.from("mitsu_plate_locations")
        .select("equipment_type,series,location_notes").limit(5);
      plateTips = data || [];
    }

    const cap = await capacityMeaning(db, model || undefined);

    const notes:string[] = [];
    if(decodedYear) notes.push("Detected a 17-character VIN/PIN; year decoded from the 10th character.");
    notes.push("Mitsubishi serials typically don't encode year in a universal way. Use the data/name plate or contact an authorized dealer to confirm.");
    notes.push("If the plate is missing/illegible: check the chassis/frame stamp; the mast and engine each have their own serial plates.");

    return NextResponse.json({
      input: { serial: normalized, model: model || null, equipmentType: equipmentType || null },
      parsed: { inferredPrefix: prefix, vinYear: decodedYear ?? null, approxCapacity: cap },
      plate: { guidance: plateTips },
      notes
    });
  } catch (e:any){
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
