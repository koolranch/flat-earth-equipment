import { createClient } from "@supabase/supabase-js";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPA_URL || !SUPA_SERVICE) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.log("Please create a .env.local file with:");
  console.log("NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co");
  console.log("SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
  process.exit(1);
}

const supabase = createClient(SUPA_URL, SUPA_SERVICE);

async function main() {
  try {
    console.log("Creating lookup schema...");
    
    // Create schema
    let { error } = await supabase.rpc('sql', {
      query: 'create schema if not exists lookup;'
    });
    
    if (error && !error.message.includes('already exists')) {
      console.error("Schema creation error:", error);
      process.exit(1);
    }
    
    console.log("Creating toyota_serial_lookup table...");
    
    // Create table
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
    `;
    
    ({ error } = await supabase.rpc('sql', { query: createTableSQL }));
    
    if (error) {
      console.error("Table creation error:", error);
      process.exit(1);
    }
    
    console.log("Creating unique index...");
    
    // Create unique index
    ({ error } = await supabase.rpc('sql', {
      query: 'create unique index if not exists ux_toyota_model_year on lookup.toyota_serial_lookup(model_code, year);'
    }));
    
    if (error && !error.message.includes('already exists')) {
      console.error("Index creation error:", error);
      process.exit(1);
    }
    
    console.log("Enabling RLS...");
    
    // Enable RLS
    ({ error } = await supabase.rpc('sql', {
      query: 'alter table lookup.toyota_serial_lookup enable row level security;'
    }));
    
    if (error && !error.message.includes('already exists')) {
      console.error("RLS error:", error);
      process.exit(1);
    }
    
    console.log("Creating read policy...");
    
    // Create read policy
    ({ error } = await supabase.rpc('sql', {
      query: `create policy if not exists "Public read" on lookup.toyota_serial_lookup for select using (true);`
    }));
    
    if (error && !error.message.includes('already exists')) {
      console.error("Policy error:", error);
      process.exit(1);
    }
    
    console.log("✅ Toyota lookup schema and table created successfully!");
    
  } catch (e) {
    console.error("Unexpected error:", e);
    process.exit(1);
  }
}

main();
