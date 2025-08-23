import { createClient } from "@supabase/supabase-js";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPA_URL || !SUPA_SERVICE) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.log("Please create a .env.local file with your Supabase credentials");
  process.exit(1);
}

const supabase = createClient(SUPA_URL, SUPA_SERVICE);

async function testLookup() {
  try {
    console.log("🧪 Testing Toyota Serial Lookup System");
    console.log("=====================================");
    
    // Test 1: Check if schema and table exist
    console.log("\n1. Testing schema and table access...");
    const { data, error } = await supabase
      .schema("lookup")
      .from("toyota_serial_lookup")
      .select("count", { count: "exact", head: true });
    
    if (error) {
      console.log("❌ Schema/table not found. Running setup...");
      await runSetup();
    } else {
      console.log(`✅ Found ${data?.length || 0} records in toyota_serial_lookup table`);
    }
    
    // Test 2: Check for sample data
    console.log("\n2. Testing sample data lookup...");
    const { data: sampleData, error: sampleError } = await supabase
      .schema("lookup")
      .from("toyota_serial_lookup")
      .select("*")
      .eq("model_code", "7FGCU25")
      .limit(3);
    
    if (sampleError) {
      console.log("❌ Error querying sample data:", sampleError.message);
    } else if (sampleData && sampleData.length > 0) {
      console.log(`✅ Found ${sampleData.length} records for 7FGCU25:`);
      sampleData.forEach(record => {
        console.log(`   Year: ${record.year}, Serial: ${record.beginning_serial}`);
      });
    } else {
      console.log("⚠️  No sample data found. Need to run seed script.");
    }
    
    // Test 3: Test lookup logic
    console.log("\n3. Testing lookup logic for serial 60013...");
    const testSerial = 60013;
    const { data: lookupData, error: lookupError } = await supabase
      .schema("lookup")
      .from("toyota_serial_lookup")
      .select("year, beginning_serial")
      .eq("model_code", "7FGCU25");
    
    if (lookupError) {
      console.log("❌ Lookup error:", lookupError.message);
    } else if (lookupData && lookupData.length > 0) {
      // Sort and find best match
      const rows = lookupData
        .map((r) => ({
          year: r.year,
          begin: parseInt(String(r.beginning_serial).replace(/\D/g, '')) || 0,
          begin_raw: r.beginning_serial
        }))
        .sort((a, b) => a.begin - b.begin);
      
      let best = null;
      for (const r of rows) {
        if (testSerial >= r.begin) best = r;
        else break;
      }
      
      if (best) {
        console.log(`✅ Serial ${testSerial} matches year ${best.year} (beginning serial: ${best.begin_raw})`);
      } else {
        console.log(`❌ No match found for serial ${testSerial}`);
      }
    }
    
    console.log("\n🎉 Toyota Serial Lookup system test completed!");
    
  } catch (e) {
    console.error("❌ Unexpected error:", e);
    process.exit(1);
  }
}

async function runSetup() {
  console.log("Setting up Toyota lookup schema and table...");
  
  // Create schema
  await supabase.rpc('sql', {
    query: 'create schema if not exists lookup;'
  });
  
  // Create table with all necessary structure
  const createTableSQL = `
    create table if not exists lookup.toyota_serial_lookup (
      id                bigserial primary key,
      model_code        text not null,
      year              int  not null check (year between 1970 and 2100),
      beginning_serial  text not null,
      source            text,
      source_page       text,
      notes             text,
      created_at        timestamptz default now()
    );
    
    create unique index if not exists ux_toyota_model_year
      on lookup.toyota_serial_lookup(model_code, year);
      
    alter table lookup.toyota_serial_lookup enable row level security;
    
    create policy if not exists "Public read"
      on lookup.toyota_serial_lookup
      for select
      using (true);
  `;
  
  await supabase.rpc('sql', { query: createTableSQL });
  console.log("✅ Schema and table created");
}

testLookup();
