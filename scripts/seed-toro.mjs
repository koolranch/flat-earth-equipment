import fs from "fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !svc) { 
  console.error("Missing Supabase envs"); 
  process.exit(1); 
}

const db = createClient(url, svc);

const read = (p) => {
  if (!fs.existsSync(p)) {
    console.log(`⚠️  File not found: ${p}`);
    return [];
  }
  console.log(`📋 Reading Toro data from ${p}...`);
  return parse(fs.readFileSync(p, "utf8"), { 
    columns: true, 
    skip_empty_lines: true 
  });
};

async function insertIgnoreDuplicates(table, rows) {
  if (!rows.length) {
    console.log(`⏭️  No data for ${table}, skipping...`);
    return;
  }
  
  console.log(`📊 Seeding ${table}...`);
  let totalProcessed = 0;
  
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    console.log(`Processing ${table} chunk ${Math.floor(i/500) + 1}/${Math.ceil(rows.length/500)}...`);
    
    const { error } = await db.from(table).insert(chunk, { count: "exact" }).select();
    if (error && error.code !== '23505') { // 23505 = duplicate key error
      console.error(`❌ Insert error ${table}:`, error); 
      process.exit(1); 
    }
    totalProcessed += chunk.length;
  }
  
  console.log(`✅ Processed ${totalProcessed} rows for ${table}`);
}

async function upsert(table, rows, onConflict) {
  if (!rows.length) {
    console.log(`⏭️  No data for ${table}, skipping...`);
    return;
  }
  
  console.log(`📊 Seeding ${table}...`);
  let totalProcessed = 0;
  
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    console.log(`Processing ${table} chunk ${Math.floor(i/500) + 1}/${Math.ceil(rows.length/500)}...`);
    
    const { error } = await db.from(table).upsert(chunk, { onConflict });
    if (error) { 
      console.error(`❌ Upsert error ${table}:`, error); 
      process.exit(1); 
    }
    totalProcessed += chunk.length;
  }
  
  console.log(`✅ Processed ${totalProcessed} rows for ${table}`);
}

(async () => {
  console.log("🏗️ Starting Toro lookup data seeding...");
  
  const cues = read("data/toro_model_cues.csv");
  const plates = read("data/toro_plate_locations.csv");
  const ranges = read("data/toro_model_serial_ranges.csv");
  
  await upsert("toro_model_cues", cues, "cue");
  await insertIgnoreDuplicates("toro_plate_locations", plates);
  await insertIgnoreDuplicates("toro_model_serial_ranges", ranges);
  
  console.log(`✅ Seeded cues=${cues.length}, plates=${plates.length}, ranges=${ranges.length}`);
  console.log("🎉 Toro lookup data is ready!");
})();
