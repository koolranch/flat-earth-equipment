import { NextResponse } from "next/server";
import { supabaseService } from '@/lib/supabase/service.server';

type PlateLoc = {
  equipment_type: string;
  series: string | null;
  location_notes: string;
  source_url: string | null;
};

type PartFit = {
  slug: string;
  name: string;
  sales_type: string | null;
  price_cents: number | null;
};

function clean(input: string) {
  return (input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// Bobcat models commonly start with one of these series letters; we use the
// first character of the model code to rank model-specific plate rows above
// generic family rows when both are returned for an equipment type.
function modelSeriesLetter(model: string | null | undefined): string | null {
  if (!model) return null;
  const m = clean(model);
  if (!m) return null;
  const first = m[0];
  if (first === "R" || first === "M" || first === "K" || first === "T" ||
      first === "S" || first === "E" || first === "L" || first === "V") {
    return first;
  }
  return null;
}

// Extract exactly 9 digits if present; else try to pull first 4 + last 5 digits
function parseBobcatSerial(raw: string) {
  const s = clean(raw);
  const digits = s.replace(/\D/g, "");
  if (digits.length >= 9) {
    // Use the last 9 digits to be resilient to prefixed text
    const block = digits.slice(-9);
    return {
      moduleCode: block.slice(0, 4),
      productionSeq: block.slice(4, 9),
      cleaned: block
    };
  }
  if (digits.length >= 5) {
    // fallback: try to interpret first 4 + last 5 if possible
    const moduleCode = digits.slice(0, 4);
    const productionSeq = digits.slice(-5);
    if (moduleCode.length === 4 && productionSeq.length === 5) {
      return { moduleCode, productionSeq, cleaned: moduleCode + productionSeq };
    }
  }
  return { error: "Serial format not recognized. Expect 9 digits (4+5)." };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serial: string = body?.serial;
    const equipmentType: string | undefined = body?.equipmentType; // Loader, Track Loader, Excavator, etc.
    const model: string | undefined = body?.model; // optional (e.g., 843 for legacy ranges)

    if (!serial) return NextResponse.json({ error: "Missing serial number" }, { status: 400 });

    const parsed = parseBobcatSerial(serial);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const admin = supabaseService();

    // Optional: lookup module dictionary
    const { data: moduleRow, error: moduleError } = await admin
      .from("bobcat_module_dictionary")
      .select("*")
      .eq("module_code", parsed.moduleCode)
      .maybeSingle();

    if (moduleError) {
      console.error("Module dictionary query error:", moduleError);
    }

    // Plate guidance for UI (by equipment type).
    // When a model is provided, surface model-specific series rows (R/M/K
    // generation matches) ahead of generic series rows so the most relevant
    // plate location appears first.
    let plateTips: PlateLoc[] = [];
    if (equipmentType) {
      const { data: tips, error: plateError } = await admin
        .from("bobcat_plate_locations")
        .select("equipment_type,series,location_notes,source_url")
        .eq("equipment_type", equipmentType);

      if (plateError) {
        console.error("Plate locations query error:", plateError);
      } else {
        plateTips = (tips || []) as PlateLoc[];
      }
    }

    const seriesLetter = modelSeriesLetter(model);
    if (model && plateTips.length > 0) {
      plateTips = plateTips
        .map((row, idx) => {
          let score = 2;
          const s = (row.series || "").toUpperCase();
          if (seriesLetter && s.startsWith(`${seriesLetter}-`)) score = 0;
          else if (seriesLetter && s.includes(seriesLetter)) score = 1;
          return { row, idx, score };
        })
        .sort((a, b) => a.score - b.score || a.idx - b.idx)
        .map(({ row }) => row);
    }

    // Optional legacy year inference if model is provided AND we have ranges.
    // Bobcat serials are mostly alphanumeric with year-cuts published as a
    // sortable prefix (e.g. A3NW17001+ for 2021 S650), so we compare the
    // cleaned 9-digit serial alphabetically against the start/end markers.
    let candidateYear: number | null = null;
    let rangesChecked = false;
    if (model) {
      rangesChecked = true;
      const cleaned = parsed.cleaned.toUpperCase();
      const seq = Number(parsed.productionSeq);
      const { data: ranges, error: rangesError } = await admin
        .from("bobcat_serial_ranges")
        .select("serial_start,serial_end,year")
        .eq("model", model);

      if (rangesError) {
        console.error("Serial ranges query error:", rangesError);
      } else {
        for (const r of ranges || []) {
          const startStr = String(r.serial_start || "").toUpperCase();
          const endStr = String(r.serial_end || "").toUpperCase();
          // Numeric comparison for legacy 5-digit ranges (e.g. 11001-11681).
          const startNum = Number(startStr.replace(/\D/g, ""));
          const endNum = Number(endStr.replace(/\D/g, ""));
          const looksNumeric = /^\d+$/.test(startStr) && /^\d+$/.test(endStr);
          if (looksNumeric && Number.isFinite(seq) && Number.isFinite(startNum) && Number.isFinite(endNum)) {
            if (seq >= startNum && seq <= endNum) {
              candidateYear = r.year as number;
              break;
            }
          } else if (cleaned >= startStr && cleaned <= endStr) {
            candidateYear = r.year as number;
            break;
          }
        }
      }
    }

    // Cross-sell: parts in the catalog that fit this model. compatible_models
    // values are stored two ways across the catalog (bare "S650" or slug-form
    // "bobcat-s650"); match against both.
    let partsThatFit: PartFit[] = [];
    if (model) {
      const m = clean(model);
      const slugForm = `bobcat-${m.toLowerCase()}`;
      const { data: parts, error: partsError } = await admin
        .from("parts")
        .select("slug,name,sales_type,price_cents,compatible_models,brand")
        .ilike("brand", "bobcat")
        .or(`compatible_models.cs.{${m}},compatible_models.cs.{${slugForm}}`)
        .limit(6);

      if (partsError) {
        console.error("Parts fitment query error:", partsError);
      } else {
        partsThatFit = ((parts || []) as Array<PartFit>).map(p => ({
          slug: p.slug,
          name: p.name,
          sales_type: p.sales_type ?? null,
          price_cents: p.price_cents ?? null
        }));
      }
    }

    const notes: string[] = [];
    if (rangesChecked && candidateYear === null && model) {
      notes.push(`No public serial-range break was found for the ${clean(model)} matching this serial. The model year is printed on the product identification plate — use that as the official year.`);
    }

    return NextResponse.json({
      input: { serial, equipmentType: equipmentType || null, model: model || null },
      modules: {
        moduleCode: parsed.moduleCode,
        productionSequence: parsed.productionSeq,
        moduleDictionaryHit: moduleRow || null
      },
      plate: {
        guidance: plateTips,
        note: "Model year is printed on the product identification plate. Use the plate date for the official year."
      },
      legacyYear: candidateYear
        ? { estimatedYear: candidateYear, method: "legacy_serial_range" }
        : null,
      partsThatFit,
      notes,
      disclaimer:
        "Bobcat serials commonly use a 4+5 digit structure (module + production sequence). Year is not encoded; check the plate. Some older models have public serial ranges for approximate year."
    });
  } catch (e: any) {
    console.error("Bobcat lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
