import { NextResponse } from "next/server";
import { supabaseService } from '@/lib/supabase/service.server';

function clean(s: string) {
  return (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function POST(req: Request) {
  try {
    const { serial, equipmentType, model } = await req.json();
    if (!serial) return NextResponse.json({ error: "Missing serial number" }, { status: 400 });

    const cleaned = clean(serial);
    const admin = supabaseService();

    // Plate tips
    let plate = { 
      guidance: [], 
      note: "Use the product identification plate for the official year; many New Holland plates print the year." 
    } as any;
    
    if (equipmentType) {
      const { data: tips, error: plateError } = await admin
        .from("nh_plate_locations")
        .select("equipment_type,series,location_notes,source_url")
        .eq("equipment_type", equipmentType);
        
      if (plateError) {
        console.error("Plate locations query error:", plateError);
      } else {
        plate.guidance = tips || [];
      }
    }

    // Prefix pattern check (e.g., T8.*)
    let prefixHit: { estimatedYear: number; method: string } | null = null;
    if (model) {
      const { data: patterns, error: prefixError } = await admin
        .from("nh_prefix_patterns")
        .select("prefix,year")
        .eq("model", model);
        
      if (prefixError) {
        console.error("Prefix patterns query error:", prefixError);
      } else {
        const hit = (patterns || []).find(p => cleaned.startsWith((p as any).prefix));
        if (hit) {
          prefixHit = { estimatedYear: (hit as any).year, method: "prefix_pattern" };
        }
      }
    }

    // Serial range check (per-model)
    let rangeHit: { estimatedYear: number; method: string } | null = null;
    if (!prefixHit && model) {
      const { data: ranges, error: rangeError } = await admin
        .from("nh_serial_ranges")
        .select("serial_start,serial_end,year")
        .eq("model", model);

      if (rangeError) {
        console.error("Serial ranges query error:", rangeError);
      } else if (ranges && ranges.length) {
        for (const r of ranges) {
          const start = clean(String(r.serial_start));
          const end = clean(String(r.serial_end));
          if (cleaned >= start && cleaned <= end) {
            rangeHit = { estimatedYear: r.year as number, method: "serial_range" };
            break;
          }
        }
      }
    }

    return NextResponse.json({
      input: { serial, cleaned, equipmentType: equipmentType || null, model: model || null },
      result: prefixHit || rangeHit || null,
      plate,
      disclaimer:
        "This tool estimates year only when model-specific prefixes or ranges are published. For exact year, read the product identification plate or contact your dealer/parts site."
    });
  } catch (e: any) {
    console.error("New Holland lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
