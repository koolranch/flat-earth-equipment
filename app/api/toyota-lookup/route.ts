export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

function toInt(input: string) {
  const cleaned = String(input || "").replace(/\D/g, '');
  if (!cleaned) return null;
  return Number(cleaned);
}

export async function POST(req: Request) {
  try {
    const { model, serial } = await req.json();

    if (!model || !serial) {
      return NextResponse.json({ error: "Missing model or serial" }, { status: 400 });
    }

    const serialNum = toInt(serial);
    if (serialNum === null || Number.isNaN(serialNum)) {
      return NextResponse.json({ error: "Invalid serial format" }, { status: 400 });
    }

    const admin = supabaseService();

    // Fetch all rows for the model; we'll sort and compute in memory to avoid DB casting tricks.
    const { data, error } = await admin
      .from("toyota_serial_lookup")
      .select("year, beginning_serial")
      .eq("model_code", model);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ match: null, message: "No rows for this model" }, { status: 200 });
    }

    // Sort by numeric value of beginning_serial ascending
    const rows = data
      .map((r) => ({
        year: r.year as number,
        begin: toInt(String(r.beginning_serial)) ?? 0,
        begin_raw: r.beginning_serial
      }))
      .filter(r => r.begin > 0) // Remove invalid serials
      .sort((a, b) => a.begin - b.begin);

    // Find the latest year with begin <= serialNum
    let best: { year: number; begin: number; begin_raw: string } | null = null;
    for (const r of rows) {
      if (serialNum >= r.begin) {
        best = r;
      } else {
        break;
      }
    }

    return NextResponse.json({
      input: { model, serial, serialNum },
      match: best
        ? { estimatedYear: best.year, matchedBeginningSerial: best.begin_raw }
        : null,
      disclaimer:
        "Estimated year based on published beginning-serial by year. If your data plate shows a manufacturing date, that is the official year.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
