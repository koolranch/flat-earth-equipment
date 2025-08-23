import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function clean(input: string) {
  return (input || "").toUpperCase().trim();
}

// Try to apply the common post-1977 rule:
// - first 3 digits = model code
// - digits 4-5 = 2-digit year
// Serial often appears like "020-77-11818" (groups separated by dashes/spaces)
function parseRaymondSerial(raw: string) {
  const s = clean(raw);
  const digitsOnly = s.replace(/\D/g, "");
  // Prefer delimited groups if present (e.g., 020-77-11818)
  const groups = s.split(/[^0-9A-Z]+/).filter(Boolean);

  // Look for pattern: [3-digit model][2-digit year][rest digits]
  let modelCode: string | null = null;
  let yearTwoDigits: string | null = null;
  let rest: string | null = null;

  // Strategy 1: use numeric groups
  const numGroups = groups.map(g => g.replace(/\D/g, "")).filter(Boolean);
  if (numGroups.length >= 2 && numGroups[0].length === 3 && numGroups[1].length === 2) {
    modelCode = numGroups[0];
    yearTwoDigits = numGroups[1];
    rest = numGroups.slice(2).join("");
  } else if (digitsOnly.length >= 7) {
    // Strategy 2: fall back to continuous digits
    modelCode = digitsOnly.slice(0, 3);
    yearTwoDigits = digitsOnly.slice(3, 5);
    rest = digitsOnly.slice(5);
  }

  if (!modelCode || !yearTwoDigits) {
    return { error: "Serial format not recognized. Expect model(3 digits), year(2 digits), then sequence." };
  }
  if (!/^\d{3}$/.test(modelCode) || !/^\d{2}$/.test(yearTwoDigits)) {
    return { error: "Serial format invalid: model/year digits malformed." };
  }

  return {
    modelCode,
    yearTwoDigits,
    sequence: rest || "",
    cleanedDigits: digitsOnly
  };
}

// Build candidate full years from a 2-digit year.
// Heuristic: 77–99 → 1977–1999; 00–29 → 2000–2029. Return both if ambiguous.
function yearCandidates(two: string) {
  const yy = Number(two);
  if (!Number.isFinite(yy) || yy < 0 || yy > 99) return [];
  const candidates: number[] = [];
  if (yy >= 77 && yy <= 99) candidates.push(1900 + yy);
  if (yy >= 0 && yy <= 29) candidates.push(2000 + yy);
  return candidates;
}

export async function POST(req: Request) {
  try {
    const { serial, truckFamily, seriesOrModel } = await req.json();
    if (!serial) return NextResponse.json({ error: "Missing serial" }, { status: 400 });

    const parsed = parseRaymondSerial(serial);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const admin = supabaseAdmin();

    // Plate guidance
    let plateTips: { truck_family: string; location_notes: string; source_url: string | null }[] = [];
    if (truckFamily) {
      const { data, error: plateError } = await admin
        .from("raymond_plate_locations")
        .select("truck_family,location_notes,source_url")
        .eq("truck_family", truckFamily);
        
      if (plateError) {
        console.error("Raymond plate locations query error:", plateError);
      } else {
        plateTips = (data || []) as any[];
      }
    } else {
      // fallback: show generic rows
      const { data, error: plateError } = await admin
        .from("raymond_plate_locations")
        .select("truck_family,location_notes,source_url")
        .limit(3);
        
      if (plateError) {
        console.error("Raymond plate locations fallback query error:", plateError);
      } else {
        plateTips = (data || []) as any[];
      }
    }

    // Optional legacy exact-year match if the user provides a series/model you've seeded
    let legacyYear: number | null = null;
    if (seriesOrModel) {
      const { data: ranges, error: rangeError } = await admin
        .from("raymond_serial_ranges")
        .select("serial_start,serial_end,year")
        .eq("series_or_model", seriesOrModel);

      if (rangeError) {
        console.error("Raymond serial ranges query error:", rangeError);
      } else if (ranges?.length) {
        const serialKey = parsed.cleanedDigits; // simple numeric compare if ranges are numeric-ish
        for (const r of ranges) {
          const start = String(r.serial_start).replace(/\D/g, "");
          const end = String(r.serial_end).replace(/\D/g, "");
          if (start && end && serialKey >= start && serialKey <= end) {
            legacyYear = r.year as number;
            break;
          }
        }
      }
    }

    const candidates = yearCandidates(parsed.yearTwoDigits);

    return NextResponse.json({
      input: { serial, truckFamily: truckFamily || null, seriesOrModel: seriesOrModel || null },
      parsed: {
        modelCode: parsed.modelCode,
        yearTwoDigits: parsed.yearTwoDigits,
        sequence: parsed.sequence
      },
      year: {
        candidates,       // prefer context (docs/age) to choose between 19xx vs 20xx
        legacyMatch: legacyYear ? { estimatedYear: legacyYear, method: "legacy_serial_range" } : null
      },
      plate: {
        guidance: plateTips,
        note: "The specification/nameplate is the authoritative source for model & serial. Use it to confirm the exact year."
      },
      disclaimer:
        "Post-1977 Raymond serials commonly follow model(3 digits) + year(2 digits) + sequence. Older lines may use ranges by series. If your nameplate is missing, check the chassis/power section stamp, but avoid shop work-order numbers."
    });
  } catch (e: any) {
    console.error("Raymond lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
