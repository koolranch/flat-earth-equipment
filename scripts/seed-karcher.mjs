import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url || !svc){ console.error('Missing Supabase envs'); process.exit(1); }
const db = createClient(url, svc);
const read = (p)=> parse(fs.readFileSync(p, 'utf8'), { columns:true, skip_empty_lines:true });

async function insertIgnore(table, rows) {
  if (!rows.length) return;
  console.log(`Seeding ${table}...`);
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await db.from(table).insert(chunk);
    if (error && !error.message?.includes('duplicate key')) {
      console.error('Insert error', table, error);
      process.exit(1);
    }
  }
}

(async ()=>{
  await insertIgnore('karcher_models', read('seeds/karcher_models.csv'));
  await insertIgnore('karcher_plate_locations', read('seeds/karcher_plate_locations.csv'));
  await insertIgnore('karcher_serial_patterns', read('seeds/karcher_serial_patterns.csv'));
  console.log('KÄRCHER seeds complete.');
})();
