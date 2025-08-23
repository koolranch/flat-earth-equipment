import fs from "fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) { console.error("Missing Supabase envs"); process.exit(1); }
const db = createClient(url, service);

function readCsv(path) {
  if (!fs.existsSync(path)) {
    console.log(`File ${path} does not exist, skipping.`);
    return [];
  }
  
  const raw = fs.readFileSync(path, "utf8");
  return parse(raw, { columns: true, skip_empty_lines: true });
}

async function insertIgnoreDuplicates(table, rows) {
  if (!rows.length) {
    console.log(`No rows to seed for ${table}`);
    return 0;
  }
  
  let totalInserted = 0;
  
  for (let i = 0; i < rows.length; i += 500) {
    const slice = rows.slice(i, i + 500);
    console.log(`Processing ${table} chunk ${Math.floor(i/500) + 1}/${Math.ceil(rows.length/500)}...`);
    
    // Use insert with ignoreDuplicates to safely handle existing rows
    const { error, count } = await db
      .from(table)
      .insert(slice, { count: "exact" })
      .select();
      
    if (error) {
      // If it's a duplicate key error, that's expected and fine
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

async function main() {
  try {
    console.log("🏗️ Reading Komatsu model prefix data...");
    const prefixes = readCsv("data/komatsu_model_prefixes.csv");
    
    console.log("📋 Reading Komatsu plate location data...");
    const plates = readCsv("data/komatsu_plate_locations.csv");
    
    console.log("🔧 Reading Komatsu IC model code key data...");
    const icKeys = readCsv("data/komatsu_ic_model_code_key.csv");
    
    console.log("📅 Reading Komatsu VIN year map data...");
    const vinMap = readCsv("data/komatsu_vin_year_map.csv");

    console.log("📊 Seeding Komatsu model prefixes...");
    const prefixesInserted = await insertIgnoreDuplicates("komatsu_model_prefixes", prefixes);
    
    console.log("📊 Seeding Komatsu plate locations...");
    const platesInserted = await insertIgnoreDuplicates("komatsu_plate_locations", plates);
    
    console.log("📊 Seeding Komatsu IC model code key...");
    const icKeysInserted = await insertIgnoreDuplicates("komatsu_ic_model_code_key", icKeys);
    
    console.log("📊 Seeding Komatsu VIN year map...");
    const vinMapInserted = await insertIgnoreDuplicates("komatsu_vin_year_map", vinMap);

    console.log(`✅ Seeded prefixes=${prefixesInserted}, plates=${platesInserted}, ic_keys=${icKeysInserted}, vin_map=${vinMapInserted}`);
    console.log("🎉 Komatsu lookup data is ready!");
    
  } catch (e) {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
