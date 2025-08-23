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

console.log("📊 Reading expanded Toyota serial ranges (no external links)...");

const rows = parse(fs.readFileSync("data/toyota_serial_ranges_expanded_no_links.csv", "utf8"), {
  columns: true, 
  skip_empty_lines: true, 
  comment: "#"
});

async function run() {
  try {
    console.log(`Processing ${rows.length} Toyota serial range rows...`);
    
    const payload = rows
      .filter(r => r.model_code && r.year && r.beginning_serial) // Skip any malformed rows
      .map(r => ({
        model_code: r.model_code.trim(),
        year: Number(r.year),
        beginning_serial: String(r.beginning_serial).trim(),
        notes: r.notes?.trim() || null
        // Explicitly NO source, source_page, source_url fields
      }));

    console.log(`Validated ${payload.length} rows for seeding...`);

    for (let i = 0; i < payload.length; i += 500) {
      const chunk = payload.slice(i, i + 500);
      console.log(`Processing chunk ${Math.floor(i/500) + 1}/${Math.ceil(payload.length/500)}...`);
      
      const { error } = await supabase
        .from("toyota_serial_lookup")
        .upsert(chunk, { onConflict: "model_code,year,beginning_serial" });
        
      if (error) { 
        console.error("Upsert error:", error); 
        process.exit(1); 
      }
    }
    
    console.log(`✅ Seeded ${payload.length} Toyota rows (no links, idempotent).`);
    console.log("🎉 Toyota expanded seed complete!");
    
  } catch (e) {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  }
}

run();
