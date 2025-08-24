import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url || !svc){ console.error('Missing Supabase env vars'); process.exit(1); }
const db = createClient(url, svc);
const read = (p)=> parse(fs.readFileSync(p, 'utf8'), { columns:true, skip_empty_lines:true });

async function insertIgnoreDuplicates(table, rows) {
  if (!rows.length) {
    console.log(`⚠️  No data to seed for ${table}`);
    return;
  }
  console.log(`📊 Seeding ${table}...`);
  
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    console.log(`Processing ${table} chunk ${Math.floor(i/500)+1}/${Math.ceil(rows.length/500)}...`);
    
    const { error } = await db.from(table).insert(chunk);
    if (error && error.code !== '23505') { // 23505 = unique_violation, ignore duplicates
      console.error(`❌ Insert error for ${table}:`, JSON.stringify(error, null, 2));
      process.exit(1);
    }
  }
  console.log(`✅ Processed ${rows.length} rows for ${table}`);
}

(async ()=>{
  console.log("🏗️ Starting Haulotte lookup data seeding...");
  
  const cues = read('data/haulotte_model_cues.csv');
  const plates = read('data/haulotte_plate_locations.csv');
  const notes = read('data/haulotte_model_serial_notes.csv');
  
  await insertIgnoreDuplicates('haulotte_model_cues', cues);
  await insertIgnoreDuplicates('haulotte_plate_locations', plates);
  await insertIgnoreDuplicates('haulotte_model_serial_notes', notes);
  
  console.log(`✅ Seeded cues=${cues.length}, plates=${plates.length}, notes=${notes.length}`);
  console.log('🎉 Haulotte lookup data is ready!');
})();
