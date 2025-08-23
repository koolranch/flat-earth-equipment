import fs from "fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) { console.error("Missing Supabase envs"); process.exit(1); }
const db = createClient(url, service);
const read = (p)=> parse(fs.readFileSync(p,"utf8"), { columns:true, skip_empty_lines:true });

async function upsert(table, rows, onConflict){
  if(!rows.length) return;
  console.log(`📊 Seeding ${table}...`);
  for(let i=0;i<rows.length;i+=500){
    const slice = rows.slice(i,i+500);
    console.log(`Processing ${table} chunk ${Math.floor(i/500) + 1}/${Math.ceil(rows.length/500)}...`);
    const { error } = await db.from(table).upsert(slice, { onConflict });
    if(error){ console.error("Upsert error", table, error); process.exit(1); }
  }
}

// Alternative insert function for tables without proper unique constraints
async function insertIgnoreDuplicates(table, rows) {
  if (!rows.length) {
    console.log(`No rows to seed for ${table}`);
    return 0;
  }
  console.log(`📊 Seeding ${table}...`);
  let totalInserted = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const slice = rows.slice(i, i + 500);
    console.log(`Processing ${table} chunk ${Math.floor(i/500) + 1}/${Math.ceil(rows.length/500)}...`);
    const { error, count } = await db
      .from(table)
      .insert(slice, { count: "exact" })
      .select();
    if (error) {
      if (error.code === '23505') {
        console.log(`  Skipping duplicates for ${table} (expected behavior)`);
        continue;
      } else {
        console.error("Insert error", table, error);
        process.exit(1);
      }
    }
    totalInserted += count || 0;
  }
  return totalInserted;
}

(async ()=>{
  console.log("🏗️ Reading Doosan model prefix data...");
  const prefixes = read("data/doosan_model_prefixes.csv");
  
  console.log("📋 Reading Doosan plate location data...");
  const plates = read("data/doosan_plate_locations.csv");
  
  console.log("🔧 Reading Doosan capacity map data...");
  const capacity = read("data/doosan_capacity_map.csv");
  
  console.log("📊 Reading Doosan VIN year map data...");
  const vinMap = read("data/doosan_vin_year_map.csv");

  await upsert("doosan_model_prefixes", prefixes, "prefix");
  await insertIgnoreDuplicates("doosan_plate_locations", plates);
  await upsert("doosan_capacity_map", capacity, "code");
  await upsert("doosan_vin_year_map", vinMap, "code");
  
  console.log(`✅ Seeded prefixes=${prefixes.length}, plates=${plates.length}, capacity=${capacity.length}, vin_map=${vinMap.length}`);
  console.log("🎉 Doosan lookup data is ready!");
})();
