import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPA_URL || !SUPA_SERVICE) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.log("Please set these environment variables and try again.");
  process.exit(1);
}

const supabase = createClient(SUPA_URL, SUPA_SERVICE);

async function main() {
  try {
    const sql = fs.readFileSync("supabase/migrations/20250823133959_20250823_lookup_toyota_serial.sql", "utf8");
    
    console.log("Executing Toyota lookup migration...");
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sql
    });
    
    if (error) {
      console.error("Migration error:", error);
      process.exit(1);
    }
    
    console.log("Migration executed successfully!");
    console.log("Created lookup schema and toyota_serial_lookup table");
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}

main();
