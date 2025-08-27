export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

const YEAR_CODES = "ABCDEFGHJKLMNPRSTUVWXYZ"; // skip I,O,Q
const START_YEAR = 1957;
const END_YEAR = 2050;

function cleanSerial(input: string) {
  return (input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function parseHysterSerial(raw: string) {
  const s = cleanSerial(raw);
  if (s.length < 5) return { error: "Serial too short (minimum 5 characters)" };

  const yearLetter = s.slice(-1);
  if (!YEAR_CODES.includes(yearLetter)) return { error: "Invalid year letter (I, O, Q not used)" };

  const body = s.slice(0, -1);
  const seqMatch = body.match(/(\d+)$/);
  if (!seqMatch) return { error: "Missing numeric sequence" };
  const sequence = seqMatch[1];

  const base = body.slice(0, body.length - sequence.length);
  if (base.length < 2) return { error: "Missing prefix/plant segment" };

  const plant = base.slice(-1);
  if (!/[A-Z]/.test(plant)) return { error: "Invalid plant code" };

  const prefix = base.slice(0, -1);
  if (!prefix) return { error: "Missing model prefix" };

  return { prefix, plant, sequence, yearLetter, cleaned: s };
}

function yearLetterFor(year: number) {
  const idx = (year - START_YEAR) % YEAR_CODES.length;
  return YEAR_CODES[idx];
}

function candidatesFor(letter: string) {
  const list: number[] = [];
  for (let y = START_YEAR; y <= END_YEAR; y++) {
    if (yearLetterFor(y) === letter) list.push(y);
  }
  return list;
}

export async function POST(req: Request) {
  try {
    const { serial } = await req.json();
    if (!serial) return NextResponse.json({ error: "Missing serial number" }, { status: 400 });

    const parsed = parseHysterSerial(serial);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const admin = supabaseService();

    // Fetch plant information
    const { data: plantRows, error: plantError } = await admin
      .from("hyster_plants")
      .select("*")
      .eq("code", parsed.plant);

    if (plantError) {
      console.error("Plant query error:", plantError);
    }

    // Fetch model prefix information
    const { data: prefixRows, error: prefixError } = await admin
      .from("hyster_model_prefixes")
      .select("*")
      .eq("prefix", parsed.prefix);

    if (prefixError) {
      console.error("Prefix query error:", prefixError);
    }

    const yearCandidates = candidatesFor(parsed.yearLetter);

    return NextResponse.json({
      input: { serial, cleaned: parsed.cleaned },
      parts: {
        prefix: parsed.prefix,
        plantCode: parsed.plant,
        sequence: parsed.sequence,
        yearLetter: parsed.yearLetter
      },
      plant: plantRows?.[0] || null,
      modelPrefix: prefixRows?.[0] || null,
      yearCandidates,
      disclaimer:
        "Year letter repeats ~every 23 years (I, O, Q skipped). Select the decade using documentation or known truck age. Data-plate month/year is official."
    });
  } catch (e: any) {
    console.error("Hyster lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
