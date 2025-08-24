import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url || !svc){ console.error('Missing Supabase envs'); process.exit(1); }
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
  console.log("🏗️ Starting Hangcha lookup data seeding...");
  
  const cues = read('data/hc_model_cues.csv');
  const plates = read('data/hc_plate_locations.csv');
  const notes = read('data/hc_model_serial_notes.csv');
  const ranges = read('data/hc_model_serial_ranges.csv');
  
  await insertIgnoreDuplicates('hc_model_cues', cues);
  await insertIgnoreDuplicates('hc_plate_locations', plates);
  await insertIgnoreDuplicates('hc_model_serial_notes', notes);
  await insertIgnoreDuplicates('hc_model_serial_ranges', ranges);
  
  console.log(`✅ Seeded cues=${cues.length}, plates=${plates.length}, notes=${notes.length}, ranges=${ranges.length}`);
  console.log('🎉 Hangcha lookup data is ready!');
})();
