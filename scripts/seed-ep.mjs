import fs from "fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !svc) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(url, svc);

function readCSV(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return parse(content, { columns: true, skip_empty_lines: true });
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return [];
  }
}

async function insertIgnoreDuplicates(table, rows, batchSize = 500) {
  if (!rows.length) {
    console.log(`⏭️  No data for ${table}, skipping...`);
    return 0;
  }

  console.log(`📊 Seeding ${table}...`);
  let totalProcessed = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const chunkNum = Math.floor(i / batchSize) + 1;
    const totalChunks = Math.ceil(rows.length / batchSize);
    
    console.log(`Processing ${table} chunk ${chunkNum}/${totalChunks}...`);

    try {
      const { error } = await supabase.from(table).insert(chunk);
      
      if (error) {
        // Check if it's a duplicate key error
        if (error.code === '23505') {
          console.log(`⚠️  Duplicate entries found in ${table}, skipping duplicates in this chunk`);
        } else {
          console.error(`❌ Error inserting into ${table}:`, error);
          throw error;
        }
      }
      
      totalProcessed += chunk.length;
    } catch (err) {
      console.error(`❌ Failed to process chunk ${chunkNum} for ${table}:`, err);
      throw err;
    }
  }

  console.log(`✅ Processed ${totalProcessed} rows for ${table}`);
  return totalProcessed;
}

async function main() {
  console.log("\n🏗️ Starting EP lookup data seeding...");

  // Read CSV files
  console.log("📋 Reading EP data from data/ep_model_cues.csv...");
  const cues = readCSV("data/ep_model_cues.csv");
  
  console.log("📋 Reading EP data from data/ep_plate_locations.csv...");
  const plates = readCSV("data/ep_plate_locations.csv");
  
  console.log("📋 Reading EP data from data/ep_model_serial_notes.csv...");
  const notes = readCSV("data/ep_model_serial_notes.csv");

  try {
    // Insert data
    const cuesCount = await insertIgnoreDuplicates("ep_model_cues", cues);
    const platesCount = await insertIgnoreDuplicates("ep_plate_locations", plates);
    const notesCount = await insertIgnoreDuplicates("ep_model_serial_notes", notes);

    console.log(`✅ Seeded cues=${cuesCount}, plates=${platesCount}, notes=${notesCount}`);
    console.log("🎉 EP lookup data is ready!");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

main();
