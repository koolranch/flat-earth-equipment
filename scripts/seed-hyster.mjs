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

function readCsv(path) {
  const raw = fs.readFileSync(path, "utf8");
  return parse(raw, { columns: true, skip_empty_lines: true });
}

async function upsert(table, rows, conflict) {
  const chunkSize = 500;
  let totalInserted = 0;
  
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    console.log(`Processing ${table} chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(rows.length/chunkSize)}...`);
    
    const { error, count } = await supabase
      .from(table)
      .upsert(chunk, { onConflict: conflict, count: "exact" });
      
    if (error) {
      console.error(`Upsert error for ${table}:`, error);
      process.exit(1);
    }
    
    totalInserted += count || chunk.length;
  }
  
  return totalInserted;
}

async function main() {
  try {
    console.log("🏭 Reading Hyster plant data...");
    const plants = readCsv("data/hyster_plants.csv");
    
    console.log("🔧 Reading Hyster model prefix data...");
    const prefixes = readCsv("data/hyster_model_prefixes.csv");

    console.log("📊 Seeding Hyster plants...");
    const plantsInserted = await upsert("hyster_plants", plants, "code");
    
    console.log("📊 Seeding Hyster model prefixes...");
    const prefixesInserted = await upsert("hyster_model_prefixes", prefixes, "prefix");

    console.log(`✅ Seeded ${plantsInserted} plants and ${prefixesInserted} model prefixes.`);
    console.log("🎉 Hyster lookup data is ready!");
    
  } catch (e) {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
