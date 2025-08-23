import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Year letters (I,O,Q skipped). Dealers publish S=1995, ..., Y=2024, Z=2025, A=2026, etc.
const ORDER = "STUVWXYZABCDEFGHJKLMNPR"; // baseYear = 1995 + index

function clean(input: string) {
  return (input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function parseYaleSerial(raw: string) {
  const s = clean(raw);
  if (!s.length) return { error: "Empty serial" };

  const last = s.slice(-1);
  // Post-1995 Yale normally ends with a year letter (I,O,Q excluded)
  const hasYearLetter = /^[A-HJ-NPR-Z]$/.test(last);

  // Try parsing as: [prefix...][plant:1 letter][sequence:>=3-6 digits][year:1 letter?]
  // Sequence length varies; we take trailing digits before the last letter (if present).
  let yearLetter = hasYearLetter ? last : null;
  const core = hasYearLetter ? s.slice(0, -1) : s;

  const seqMatch = core.match(/(\d+)$/);
  if (!seqMatch) return { error: "Missing numeric sequence" };
  const productionSeq = seqMatch[1];
  const head = core.slice(0, core.length - productionSeq.length);
  if (!head.length) return { error: "Missing prefix/plant segment" };

  const plant = head.slice(-1); // 1-letter plant
  if (!/[A-Z]/.test(plant)) return { error: "Invalid plant code" };

  const prefix = head.slice(0, -1); // design/series
  if (!prefix) return { error: "Missing design/series prefix" };

  return { prefix, plant, productionSeq, yearLetter, cleaned: s };
}

function yearCandidates(letter: string | null) {
  if (!letter) return [];
  const idx = ORDER.indexOf(letter);
  if (idx < 0) return [];

  const base = 1995 + idx;
  // Yale's letter scheme is documented post-1995; provide forward cycle (every 23 yrs)
  const out: number[] = [];
  for (let y = base; y <= 2050; y += 23) out.push(y);
  return out;
}

export async function POST(req: Request) {
  try {
    const { serial } = await req.json();
    if (!serial) return NextResponse.json({ error: "Missing serial" }, { status: 400 });

    const parsed = parseYaleSerial(serial);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const admin = supabaseAdmin();

    const { data: plantRows, error: plantError } = await admin
      .from("yale_plants")
      .select("*")
      .eq("code", parsed.plant);

    if (plantError) {
      console.error("Yale plants query error:", plantError);
    }

    const { data: prefixRows, error: prefixError } = await admin
      .from("yale_model_prefixes")
      .select("*")
      .eq("prefix", parsed.prefix);

    if (prefixError) {
      console.error("Yale model prefixes query error:", prefixError);
    }

    const years = yearCandidates(parsed.yearLetter);

    return NextResponse.json({
      input: { serial, cleaned: parsed.cleaned },
      parts: {
        prefix: parsed.prefix,
        plantCode: parsed.plant,
        productionSequence: parsed.productionSeq,
        yearLetter: parsed.yearLetter
      },
      plant: plantRows?.[0] || null,
      modelPrefix: prefixRows?.[0] || null,
      yearCandidates: years,
      disclaimer:
        parsed.yearLetter
          ? "Year letter repeats every ~23 years (I, O, Q are not used). Choose the decade using documentation or known truck age."
          : "This serial may be pre-1995 or nonstandard; year may not be encoded as a trailing letter. Check the data plate or dealer records."
    });
  } catch (e: any) {
    console.error("Yale lookup error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
