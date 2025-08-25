/* Seed importer for fault code tables. Run with: NODE_OPTIONS='--loader ts-node/esm' ts-node scripts/seed-faults.ts */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function toArray(s?: string) {
  if (!s) return null;
  return s.split(';').map(v => v.trim()).filter(Boolean);
}

async function upsertFaults(csvPath: string) {
  const rows = parse(fs.readFileSync(csvPath, 'utf8'), { columns: true, skip_empty_lines: true });
  console.log(`Processing ${rows.length} fault codes from ${csvPath}`);
  
  for (const r of rows) {
    const payload: any = {
      brand_slug: r.brand, 
      model_pattern: r.model_pattern || null, 
      code: r.code,
      description: r.title || null, 
      category: null, // Will be categorized later
      severity: r.severity || 'fault',
      solution: r.meaning || null,
      manual_reference: null,
      source_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert into fault_codes table
    const { error } = await supabase.from('fault_codes').insert([payload]);
    if (error) {
      console.error('Fault insert error', csvPath, r.code, error.message);
    } else {
      console.log(`✓ Inserted ${r.brand} fault code: ${r.code}`);
    }
  }
}

async function upsertRetrieval(csvPath: string) {
  const rows = parse(fs.readFileSync(csvPath, 'utf8'), { columns: true, skip_empty_lines: true });
  console.log(`Processing retrieval steps from ${csvPath}`);
  
  for (const r of rows) {
    // For now, we'll just log these - they could be added to a separate table later
    console.log(`${r.brand}: ${r.steps}`);
  }
}

async function main() {
  const faultDir = path.join(process.cwd(), 'data/seed/fault-codes');
  const retDir = path.join(process.cwd(), 'data/seed/retrieval');
  const brands = ['jlg', 'genie', 'toyota', 'jcb', 'hyster'];
  
  console.log('🔧 Starting fault code seeding...\n');
  
  for (const brand of brands) {
    console.log(`\n📁 Processing ${brand.toUpperCase()}...`);
    
    const faultFile = path.join(faultDir, `${brand}.csv`);
    if (fs.existsSync(faultFile)) {
      await upsertFaults(faultFile);
    } else {
      console.log(`⚠️  Fault file not found: ${faultFile}`);
    }
    
    const retFile = path.join(retDir, `${brand}.csv`);
    if (fs.existsSync(retFile)) {
      await upsertRetrieval(retFile);
    } else {
      console.log(`⚠️  Retrieval file not found: ${retFile}`);
    }
  }
  
  console.log('\n✅ Fault code seeding complete!');
  console.log('📝 Note: This is minimal seed data - expand with more fault codes as needed.');
}

main().catch(e => { 
  console.error('❌ Seeding failed:', e); 
  process.exit(1); 
});
