import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing!");
  process.exit(1);
}

console.log("Connecting to Supabase at:", url);
const supabase = createClient(url, anon);

async function checkParts() {
  try {
    // Fetch count via a small select
    const { count, error: countErr } = await supabase
      .from("parts")
      .select("id", { count: "exact" })
      .limit(0);
    
    if (countErr) {
      console.error("Count error:", countErr);
      console.log("\nPossible issues:");
      console.log("1. The 'parts' table doesn't exist yet. Please create it using the SQL in supabase/schema.sql");
      console.log("2. Row Level Security (RLS) isn't configured to allow anonymous reads");
      console.log("3. Your Supabase credentials might be incorrect");
      process.exit(1);
    }
    
    console.log(`\n✅ Parts table found with ${count} rows!`);
    
    // Fetch the first 5 parts
    const { data: parts, error } = await supabase
      .from("parts")
      .select("slug,name,price,category,brand")
      .order('name')
      .limit(5);
    
    if (error) {
      console.error("Query error:", error.message);
      process.exit(1);
    }
    
    console.log("\n📋 First 5 parts:");
    if (parts.length === 0) {
      console.log("No parts found. Run the sample data SQL in supabase/sample-data.sql to add some parts.");
    } else {
      parts.forEach(p => console.log(`• ${p.slug} → ${p.name} ($${p.price}) [${p.category}/${p.brand}]`));
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

checkParts(); 