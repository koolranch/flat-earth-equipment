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
  if (!fs.existsSync(path)) {
    console.log(`File not found: ${path}, skipping...`);
    return [];
  }
  const raw = fs.readFileSync(path, "utf8");
  return parse(raw, { columns: true, skip_empty_lines: true });
}

async function upsert(table, rows, onConflict) {
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
      .upsert(slice, { onConflict, count: "exact" });
      
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
    console.log("🏭 Reading Raymond plate location data...");
    const plates = readCsv("data/raymond_plate_locations.csv");
    
    console.log("📋 Reading Raymond serial rules data...");
    const rules = readCsv("data/raymond_serial_rules.csv");
    
    console.log("📊 Reading Raymond serial ranges data...");
    const ranges = readCsv("data/raymond_serial_ranges.csv");
    
    console.log("🔧 Reading Raymond model families data...");
    const families = readCsv("data/raymond_model_families.csv");

    console.log("📊 Seeding Raymond plate locations...");
    const platesInserted = await upsert("raymond_plate_locations", plates, "id");
    
    console.log("📊 Seeding Raymond serial rules...");
    const rulesInserted = await upsert("raymond_serial_rules", rules, "rule_name");
    
    console.log("📊 Seeding Raymond serial ranges...");
    const rangesInserted = await upsert("raymond_serial_ranges", ranges, "id");
    
    console.log("📊 Seeding Raymond model families...");
    const familiesInserted = await upsert("raymond_model_families", families, "code");

    console.log(`✅ Seeded raymond_plate_locations=${platesInserted}, raymond_serial_rules=${rulesInserted}, raymond_serial_ranges=${rangesInserted}, raymond_model_families=${familiesInserted}`);
    console.log("🎉 Raymond lookup data is ready!");
    
  } catch (e) {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
