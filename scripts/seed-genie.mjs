import fs from "fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) { 
  console.error("Missing Supabase envs"); 
  console.log("Please ensure environment variables are set:");
  console.log("NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co");
  console.log("SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
  process.exit(1); 
}
const supabase = createClient(url, service);

function readCsv(p) {
  if (!fs.existsSync(p)) {
    console.log(`File not found: ${p}, skipping...`);
    return [];
  }
  const raw = fs.readFileSync(p, "utf8");
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
    const { error, count } = await supabase
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

(async () => {
  try {
    console.log("🔧 Reading Genie plate location data...");
    const plates = readCsv("data/genie_plate_locations.csv");
    
    console.log("📋 Reading Genie model prefixes data...");
    const prefixes = readCsv("data/genie_model_prefixes.csv");
    
    console.log("📊 Reading Genie serial breaks data...");
    const breaks = readCsv("data/genie_serial_breaks.csv");

    console.log("📊 Seeding Genie plate locations...");
    const platesInserted = await insertIgnoreDuplicates("genie_plate_locations", plates);
    
    console.log("📊 Seeding Genie model prefixes...");
    const prefixesInserted = await insertIgnoreDuplicates("genie_model_prefixes", prefixes);
    
    console.log("📊 Seeding Genie serial breaks...");
    const breaksInserted = await insertIgnoreDuplicates("genie_serial_breaks", breaks);

    console.log(`✅ Seeded genie_plate_locations=${platesInserted}, genie_model_prefixes=${prefixesInserted}, genie_serial_breaks=${breaksInserted}`);
    console.log("🎉 Genie seed complete.");
    
  } catch (e) {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  }
})();
