import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service.server";

const supabase = () => supabaseService();

function clean(s: string) { 
  return (s || "").trim().toUpperCase(); 
}

const CUES = [
  "540-170", "535-95", "531-70", // longest first for telehandlers
  "3TS", "190T", "150T",         // skid steer/CTL
  "220X", "JS",                  // excavators
  "457", "427", "411",           // wheel loaders
  "LOADALL", "TM", "4CX", "3CX"  // families/aliases
];

function inferCue(input: string) {
  const s = clean(input);
  for (const c of CUES) { 
    if (s.startsWith(c)) return c; 
  }
  const m = s.match(/\b(540-170|535-95|531-70|3TS|190T|150T|220X|JS|457|427|411|LOADALL|TM|4CX|3CX)\b/i);
  return m ? m[1].toUpperCase() : null;
}

async function vinYear(db: any, serial: string) {
  const pin = serial.replace(/[^A-Z0-9]/g, "").toUpperCase();
  if (pin.length !== 17) return null;
  const code = pin[9];
  const { data } = await db.from("jcb_vin_year_map").select("year").eq("code", code);
  return data?.[0]?.year || null;
}

export async function POST(req: Request) {
  try {
    const { serial, model, equipmentType } = await req.json();
    if (!serial) return NextResponse.json({ error: "Missing serial/PIN" }, { status: 400 });

    const db = supabase();
    const normalized = clean(serial);
    const txt = clean([model, serial].filter(Boolean).join(" "));
    const cue = inferCue(txt);

    // Resolve family from explicit type or cue
    let family = equipmentType || null;
    if (!family && cue) {
      const { data: map } = await db.from("jcb_model_cues").select("family").eq("cue", cue);
      family = map?.[0]?.family || null;
    }

    // Plate guidance.
    // When a model is provided, surface model-specific series rows ahead of
    // generic family rows so the most relevant plate location appears first.
    let plateTips: any[] = [];
    if (family) {
      const { data } = await db.from("jcb_plate_locations")
        .select("equipment_type,series,location_notes")
        .ilike("equipment_type", `%${family}%`);
      plateTips = data || [];
    } else {
      const { data } = await db.from("jcb_plate_locations")
        .select("equipment_type,series,location_notes").limit(6);
      plateTips = data || [];
    }

    if (model && plateTips.length > 0) {
      const m = clean(model);
      plateTips = plateTips
        .map((row, idx) => {
          const s = (row.series || "").toUpperCase();
          let score = 2;
          if (m && s.includes(m)) score = 0;
          else if (cue && s.includes(cue)) score = 1;
          return { row, idx, score };
        })
        .sort((a, b) => a.score - b.score || a.idx - b.idx)
        .map(({ row }) => row);
    }

    // Series notes
    const { data: series } = await db.from("jcb_series_examples").select("*").limit(6);

    // VIN year (true 17-char PIN only)
    const year = await vinYear(db, normalized);

    // Cross-sell: parts in the catalog that fit this model. compatible_models
    // values are stored two ways across the catalog (bare model code or
    // slug-form 'jcb-<model>'); match against both. Order by is_fast_moving
    // DESC so when the user flags fast-moving SKUs they surface first.
    let partsThatFit: any[] = [];
    if (model) {
      const m = clean(model);
      const slugForm = `jcb-${m.toLowerCase()}`;
      const { data: parts } = await db
        .from("parts")
        .select("slug,name,sales_type,price_cents,is_fast_moving")
        .ilike("brand", "jcb")
        .or(`compatible_models.cs.{${m}},compatible_models.cs.{${slugForm}}`)
        .order("is_fast_moving", { ascending: false })
        .limit(6);
      partsThatFit = parts || [];
    }

    const notes: string[] = [];
    if (year) notes.push("Detected a true 17-character PIN; decoded model year from the 10th character.");
    notes.push("Most JCB serials/PINs do not encode year in a single universal way. Use the machine identification plate to confirm details, or contact an authorized JCB dealer.");
    notes.push("Major components (engine, axles, gearbox) carry their own serial plates.");
    if (model && !family) {
      notes.push(`We could not infer an equipment family for ${clean(model)} from our cue list. Read the chassis identification plate for the PIN — that is what your dealer uses for parts.`);
    }

    return NextResponse.json({
      input: { serial: normalized, model: model || null, equipmentType: equipmentType || null },
      parsed: { inferredCue: cue, family: family || null, vinYear: year ?? null },
      plate: { guidance: plateTips },
      seriesExamples: series || [],
      partsThatFit,
      notes
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
