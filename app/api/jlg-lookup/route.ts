import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function clean(s:string){ return (s||"").trim().toUpperCase(); }

// Order longest-to-shortest to avoid partials (TOUCAN before T; AJ before A; SJ before S)
const PREFIXES = ["TOUCAN","AJ","SJ","ES","AE","RT","RO","R","T","A","S","E","M"];

function inferPrefixFromModelOrSerial(input:string){
  const s = clean(input);
  for(const p of PREFIXES){ if(s.startsWith(p)) return p; }
  const m = s.match(/\b(TOUCAN|AJ|SJ|ES|AE|RT|R|T|A|S|E|M)\s*[\dA-Z-]*/i);
  return m ? m[1].toUpperCase() : null;
}

function isTelehandlerModel(model?:string){
  if(!model) return false;
  const s = clean(model);
  // Common JLG telehandler patterns (642/742/943/1043/1055/1255, "G10-55A", etc.)
  return /\b(642|742|943|1043|1055|1255|1075|G\d{2}-\d{2}A)\b/.test(s);
}

async function vinYear(db:any, serial:string){
  const vin = serial.replace(/[^A-Z0-9]/g,"").toUpperCase();
  if(vin.length !== 17) return null;
  const code = vin[9];
  const { data, error } = await db.from("jlg_vin_year_map").select("year").eq("code", code);
  if(error) return null;
  return data?.[0]?.year || null;
}

async function esCountry(db:any, serial:string){
  const s = serial.replace(/[^A-Z0-9]/g,"").toUpperCase();
  // ES prefixes are two characters like 02,12,B2,M2,A2 followed by digits.
  const pref = s.slice(0,2);
  const { data } = await db.from("jlg_es_country_prefix").select("*").eq("prefix", pref);
  return data?.[0] || null;
}

function familyFromPrefix(prefix:string|null, model?:string){
  if(isTelehandlerModel(model)) return "Telehandler";
  switch(prefix){
    case "S": case "SJ": return "Boom Lift (Telescopic)";
    case "A": case "AJ": case "E": return "Boom Lift (Articulating)";
    case "ES": case "AE": return "Scissor (ES/Slab)";
    case "RT": case "R": return "Scissor (RT)";
    case "T": case "TOUCAN": return "Mast/Toucan";
    default:
      // fallback from model keywords even if prefix not found
      if(model){
        const m = clean(model);
        if(/\b(600S|660SJ|860SJ|400S|460SJ)\b/.test(m)) return "Boom Lift (Telescopic)";
        if(/\b(450AJ|400A|800AJ|E450AJ|M450AJ)\b/.test(m)) return "Boom Lift (Articulating)";
        if(/\b(1930ES|2032ES|2632ES|2646ES|3246ES|AE1932)\b/.test(m)) return "Scissor (ES/Slab)";
        if(/\b(3394RT|4394RT|RT)\b/.test(m)) return "Scissor (RT)";
        if(/\b(T26E|T32E|TOUCAN)\b/.test(m)) return "Mast/Toucan";
      }
      return null;
  }
}

export async function POST(req: Request){
  try{
    const { serial, model, equipmentType } = await req.json();
    if(!serial) return NextResponse.json({ error: "Missing serial/PIN" }, { status: 400 });

    const db = supabase();
    const normalized = clean(serial);
    const txt = clean([model, serial].filter(Boolean).join(" "));
    const inferredPrefix = inferPrefixFromModelOrSerial(txt);

    let inferredFamily = familyFromPrefix(inferredPrefix, model || undefined);
    // if user supplied a specific type, respect it
    const family = equipmentType || inferredFamily || null;

    // VIN-year decoding only if true 17-char VIN/PIN
    const year = await vinYear(db, normalized);

    // ES country prefix hint (only if it looks like an ES-style numeric tag)
    const es = await esCountry(db, normalized);

    // Plate guidance
    let plateTips:any[] = [];
    if(family){
      const { data } = await db.from("jlg_plate_locations")
        .select("equipment_type,series,location_notes")
        .ilike("equipment_type", `%${family}%`);
      plateTips = data || [];
    } else {
      const { data } = await db.from("jlg_plate_locations")
        .select("equipment_type,series,location_notes").limit(6);
      plateTips = data || [];
    }

    const notes:string[] = [];
    if(year) notes.push("Detected a 17-character VIN/PIN; decoded model year from the 10th character.");
    notes.push("JLG serials typically do not encode year in a universal way. Use the data/name plate to confirm model year and details.");
    notes.push("If the plate is missing/illegible, check the stamped frame serial (locations vary by series).");

    return NextResponse.json({
      input: { serial: normalized, model: model || null, equipmentType: equipmentType || null },
      parsed: {
        inferredPrefix,
        inferredFamily: family,
        vinYear: year ?? null,
        esCountry: es ? { prefix: es.prefix, country: es.country } : null
      },
      plate: { guidance: plateTips },
      notes
    });
  } catch (e:any){
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
