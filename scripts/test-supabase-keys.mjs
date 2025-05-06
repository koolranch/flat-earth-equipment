import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log("URL:", url);
console.log("Anon Key length:", anon?.length);

const supabase = createClient(url, anon);

// Try a simple table query to verify connectivity
const { data, error } = await supabase
  .from("parts")
  .select("id")
  .limit(1);
if (error) {
  console.error("❌ Supabase table query error:", error.message);
  process.exit(1);
}
console.log("✅ Supabase connectivity test passed. Sample row:", data); 