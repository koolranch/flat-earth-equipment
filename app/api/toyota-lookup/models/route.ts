import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const admin = supabaseAdmin();
    const { data, error } = await admin
      .schema("lookup")
      .from("toyota_serial_lookup")
      .select("model_code");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const set = new Set<string>();
    for (const row of data || []) {
      if (row.model_code) set.add(row.model_code);
    }
    return NextResponse.json({ models: Array.from(set).sort() });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
