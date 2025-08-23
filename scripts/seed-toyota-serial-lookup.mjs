import fs from "fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPA_URL || !SUPA_SERVICE) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.log("Please create a .env.local file with:");
  console.log("NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co");
  console.log("SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
  process.exit(1);
}

const supabase = createClient(SUPA_URL, SUPA_SERVICE);

function toInt(val) {
  const m = String(val ?? "").match(/\d+/g);
  if (!m) return null;
  return Number(m.join("")); // squashes any formatting into an integer
}

async function main() {
  try {
    console.log("Reading CSV data...");
    const csvRaw = fs.readFileSync("data/toyota_serial_lookup.csv", "utf8");
    const records = parse(csvRaw, { columns: true, skip_empty_lines: true });

    console.log(`Found ${records.length} records to process`);

    // validate + normalize
    const rows = records.map((r) => ({
      model_code: String(r.model_code || "").trim(),
      year: Number(r.year),
      beginning_serial: String(r.beginning_serial || "").trim(),
      source: r.source || null,
      source_page: r.source_page || null,
      notes: r.notes || null
    })).filter(r =>
      r.model_code && Number.isInteger(r.year) && r.beginning_serial
    );

    console.log(`Validated ${rows.length} records for insertion`);

    // First, ensure the schema and table exist
    console.log("Ensuring lookup schema exists...");
    await supabase.rpc('sql', {
      query: 'create schema if not exists lookup;'
    });

    console.log("Ensuring toyota_serial_lookup table exists...");
    const createTableSQL = `
      create table if not exists lookup.toyota_serial_lookup (
        id                bigserial primary key,
        model_code        text not null,
        year              int  not null check (year between 1970 and 2100),
        beginning_serial  text not null,
        source            text,
        source_page       text,
        notes             text,
        created_at        timestamptz default now()
      );
      
      create unique index if not exists ux_toyota_model_year
        on lookup.toyota_serial_lookup(model_code, year);
        
      alter table lookup.toyota_serial_lookup enable row level security;
      
      create policy if not exists "Public read"
        on lookup.toyota_serial_lookup
        for select
        using (true);
    `;
    
    await supabase.rpc('sql', { query: createTableSQL });

    // chunked upsert to avoid payload limits
    const chunkSize = 500;
    let totalInserted = 0;
    
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      console.log(`Processing chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(rows.length/chunkSize)}...`);
      
      const { error, count } = await supabase
        .schema("lookup")
        .from("toyota_serial_lookup")
        .upsert(chunk, { onConflict: "model_code,year", count: "exact" });

      if (error) {
        console.error("Upsert error:", error);
        process.exit(1);
      }
      
      totalInserted += count || chunk.length;
    }

    console.log(`✅ Seeded ${totalInserted} rows into lookup.toyota_serial_lookup`);
    console.log("Toyota serial lookup data is ready!");
    
  } catch (e) {
    console.error("Error during seeding:", e);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
