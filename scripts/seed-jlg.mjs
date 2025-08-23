import fs from "fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url || !svc){ console.error("Missing Supabase envs"); process.exit(1); }
const db = createClient(url, svc);
const read = (p)=> parse(fs.readFileSync(p,"utf8"), { columns:true, skip_empty_lines:true });

async function upsert(table, rows, onConflict){
  if(!rows.length) return;
  console.log(`📊 Seeding ${table}...`);
  for(let i=0;i<rows.length;i+=500){
    const chunk = rows.slice(i,i+500);
    console.log(`Processing ${table} chunk ${Math.floor(i/500) + 1}/${Math.ceil(rows.length/500)}...`);
    const { error } = await db.from(table).upsert(chunk, { onConflict });
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
    const chunk = rows.slice(i, i + 500);
    console.log(`Processing ${table} chunk ${Math.floor(i/500) + 1}/${Math.ceil(rows.length/500)}...`);
    const { error, count } = await db
      .from(table)
      .insert(chunk, { count: "exact" })
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
  console.log("🏗️ Reading JLG model prefix data...");
  const prefixes = read("data/jlg_model_prefixes.csv");
  
  console.log("📋 Reading JLG plate location data...");
  const plates = read("data/jlg_plate_locations.csv");
  
  console.log("🌍 Reading JLG ES country prefix data...");
  const countries = read("data/jlg_es_country_prefix.csv");
  
  console.log("📊 Reading JLG VIN year map data...");
  const vinMap = read("data/jlg_vin_year_map.csv");

  await upsert("jlg_model_prefixes", prefixes, "prefix");
  await insertIgnoreDuplicates("jlg_plate_locations", plates);
  await upsert("jlg_es_country_prefix", countries, "prefix");
  await upsert("jlg_vin_year_map", vinMap, "code");
  
  console.log(`✅ Seeded prefixes=${prefixes.length}, plates=${plates.length}, countries=${countries.length}, vin_map=${vinMap.length}`);
  console.log("🎉 JLG lookup data is ready!");
})();
