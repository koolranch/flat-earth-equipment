import fs from "fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) { 
  console.error("Missing Supabase envs"); 
  process.exit(1); 
}
const supabase = createClient(url, service);

function readCsv(path) {
  if (!fs.existsSync(path)) {
    console.log(`File not found: ${path}, skipping...`);
    return [];
  }
  const raw = fs.readFileSync(path, "utf8");
  return parse(raw, { columns: true, skip_empty_lines: true });
}

async function upsert(table, rows, conflict) {
  if (!rows.length) {
    console.log(`No rows to seed for ${table}`);
    return 0;
  }
  
  const chunk = 500;
  let totalInserted = 0;
  
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    console.log(`Processing ${table} chunk ${Math.floor(i/chunk) + 1}/${Math.ceil(rows.length/chunk)}...`);
    
    const { error, count } = await supabase
      .from(table)
      .upsert(slice, { onConflict: conflict, count: "exact" });
      
    if (error) { 
      console.error(`Upsert error: ${table}`, error); 
      process.exit(1); 
    }
    
    totalInserted += count || slice.length;
  }
  
  return totalInserted;
}

async function main() {
  try {
    console.log("🏭 Reading Yale plant data...");
    const plants = readCsv("data/yale_plants.csv");
    
    console.log("🔧 Reading Yale model prefix data...");
    const prefixes = readCsv("data/yale_model_prefixes.csv");

    console.log("📊 Seeding Yale plants...");
    const plantsInserted = await upsert("yale_plants", plants, "code");
    
    console.log("📊 Seeding Yale model prefixes...");
    const prefixesInserted = await upsert("yale_model_prefixes", prefixes, "prefix");

    console.log(`✅ Seeded yale_plants=${plantsInserted}, yale_model_prefixes=${prefixesInserted}`);
    console.log("🎉 Yale lookup data is ready!");
    
  } catch (e) {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
