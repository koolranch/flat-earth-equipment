import fs from "fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) { 
  console.error("Missing Supabase envs"); 
  process.exit(1); 
}

const db = createClient(url, service);

const read = (p) => {
  if (!fs.existsSync(p)) {
    console.log(`⚠️  File not found: ${p}`);
    return [];
  }
  console.log(`📋 Reading JCB data from ${p}...`);
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
  console.log("🏗️ Starting JCB lookup data seeding...");
  
  const cues = read("data/jcb_model_cues.csv");
  const plates = read("data/jcb_plate_locations.csv");
  const vinMap = read("data/jcb_vin_year_map.csv");
  const series = read("data/jcb_series_examples.csv");
  
  await upsert("jcb_model_cues", cues, "cue");
  await insertIgnoreDuplicates("jcb_plate_locations", plates);
  await upsert("jcb_vin_year_map", vinMap, "code");
  await upsert("jcb_series_examples", series, "code");
  
  console.log(`✅ Seeded cues=${cues.length}, plates=${plates.length}, vin_map=${vinMap.length}, series=${series.length}`);
  console.log("🎉 JCB lookup data is ready!");
})();
