#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load local env (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
dotenv.config({ path: path.resolve(".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);

async function main() {
  const csv = fs.readFileSync("data/parts_green_chargers.csv", "utf8");
  const records = parse(csv, { columns: true, skip_empty_lines: true });

  const chunk = 500;
  for (let i = 0; i < records.length; i += chunk) {
    const slice = records.slice(i, i + chunk);

    slice.forEach((r: any) => {
      if (!r.id || r.id === "") delete r.id; // let DB default UUID apply
      r.price_cents = Number(r.price_cents || 0);
      r.has_core_charge = String(r.has_core_charge).toLowerCase() === "true";
      r.featured = String(r.featured).toLowerCase() === "true";
    });

    const { error } = await supabase.from("parts").upsert(slice, { onConflict: "slug" });

    if (error) throw error;
    console.log(`Upserted ${slice.length} rows`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


