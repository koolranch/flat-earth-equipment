import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type PlateLoc = {
  equipment_type: string;
  series: string | null;
  location_notes: string;
  source_url: string | null;
};

function clean(input: string) {
  return (input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
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

    const admin = supabaseAdmin();

    // Optional: lookup module dictionary
    const { data: moduleRow, error: moduleError } = await admin
      .from("bobcat_module_dictionary")
      .select("*")
      .eq("module_code", parsed.moduleCode)
      .maybeSingle();

    if (moduleError) {
      console.error("Module dictionary query error:", moduleError);
    }

    // Plate guidance for UI (by equipment type)
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

    // Optional legacy year inference if model is provided AND we have ranges
    let candidateYear: number | null = null;
    if (model) {
      const seq = Number(parsed.productionSeq);
      if (Number.isFinite(seq)) {
        const { data: ranges, error: rangesError } = await admin
          .from("bobcat_serial_ranges")
          .select("serial_start,serial_end,year")
          .eq("model", model);
          
        if (rangesError) {
          console.error("Serial ranges query error:", rangesError);
        } else {
          for (const r of ranges || []) {
            const start = Number(String(r.serial_start).replace(/\D/g, ""));
            const end = Number(String(r.serial_end).replace(/\D/g, ""));
            if (Number.isFinite(start) && Number.isFinite(end) && seq >= start && seq <= end) {
              candidateYear = r.year as number;
              break;
            }
          }
        }
      }
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
      disclaimer:
        "Bobcat serials commonly use a 4+5 digit structure (module + production sequence). Year is not encoded; check the plate. Some older models have public serial ranges for approximate year."
    });
  } catch (e: any) {
    console.error("Bobcat lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
