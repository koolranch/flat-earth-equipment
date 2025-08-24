import fs from "fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url || !svc){ console.error("Missing Supabase envs"); process.exit(1); }
const db = createClient(url, svc);
const read = (p)=> parse(fs.readFileSync(p,"utf8"), { columns:true, skip_empty_lines:true });

async function insertIgnoreDuplicates(table, rows) {
  if (!rows.length) {
    console.log(`⚠️  No data to seed for ${table}`);
    return;
  }
  console.log(`📊 Seeding ${table}...`);
  
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    console.log(`Processing ${table} chunk ${Math.floor(i/500)+1}/${Math.ceil(rows.length/500)}...`);
    
    const { error } = await db.from(table).insert(chunk);
    if (error && error.code !== '23505') { // 23505 = unique_violation, ignore duplicates
      console.error(`❌ Insert error for ${table}:`, error);
      process.exit(1);
    }
  }
  console.log(`✅ Processed ${rows.length} rows for ${table}`);
}

(async ()=>{
  console.log("🏗️ Starting Skyjack lookup data seeding...");
  
  console.log("📋 Reading Skyjack data from data/skyjack_model_cues.csv...");
  console.log("📋 Reading Skyjack data from data/skyjack_plate_locations.csv...");
  console.log("📋 Reading Skyjack data from data/skyjack_model_serial_ranges.csv...");
  
  const cues = read("data/skyjack_model_cues.csv");
  const plates = read("data/skyjack_plate_locations.csv");
  const ranges = read("data/skyjack_model_serial_ranges.csv");
  
  await insertIgnoreDuplicates("skyjack_model_cues", cues);
  await insertIgnoreDuplicates("skyjack_plate_locations", plates);
  await insertIgnoreDuplicates("skyjack_model_serial_ranges", ranges);
  
  console.log(`✅ Seeded cues=${cues.length}, plates=${plates.length}, ranges=${ranges.length}`);
  console.log("🎉 Skyjack lookup data is ready!");
})();
