const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
if (!url || !svc) { console.error('Missing Supabase env vars'); process.exit(1); }
const db = createClient(url, svc);

function readCsv(path: string) {
  return parse(fs.readFileSync(path, 'utf8'), { columns: true, skip_empty_lines: true });
}

async function insertIgnoreDuplicates(table: string, rows: any[]) {
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
      console.error(`❌ Insert error for ${table}:`, error);
      process.exit(1);
    }
  }
  console.log(`✅ Processed ${rows.length} rows for ${table}`);
}

async function main() {
  console.log("🏗️ Starting Manitou lookup data seeding...");
  
  // Expand aliases into rows
  const models = readCsv('data/manitou_models.csv');
  const aliasRows: any[] = [];
  for (const r of models) {
    const family = (r.family || '').trim();
    const normalized = (r.model_code || '').trim();
    const aliases = String(r.alias || '').split('|').map((s: string) => s.trim()).filter(Boolean);
    for (const a of aliases) aliasRows.push({ family, alias: a.toUpperCase(), normalized });
  }

  const plates = readCsv('data/manitou_plate_locations.csv');

  await insertIgnoreDuplicates('snl.manitou_model_aliases', aliasRows);
  await insertIgnoreDuplicates('snl.manitou_plate_locations', plates);

  // Starter disclaimers per family
  const families = Array.from(new Set(aliasRows.map(r => r.family).concat(plates.map((p: any) => p.family))));
  const starter = families.map(f => ({
    family: f,
    model_code: null,
    serial_rule: null,
    rule_type: 'none',
    disclaimer: "Exact year decoding varies by model/market. Use the machine's Manufacturer's plate (Serial Number / Product Identification Number) and quote the full serial for parts/service.",
    source_ids: []
  }));
  await insertIgnoreDuplicates('snl.manitou_serial_lookup', starter);

  console.log(`✅ Seeded aliases=${aliasRows.length}, plates=${plates.length}, families=${families.length}`);
  console.log('🎉 Manitou lookup data is ready!');
}

main().catch(e => { console.error(e); process.exit(1); });
