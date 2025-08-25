import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const DATA_DIR = path.join(process.cwd(), 'data', 'faults');

function splitArr(v?: string) {
  if (!v) return null;
  const a = v.split('|').map(s => s.trim()).filter(Boolean);
  return a.length ? a : null;
}

async function seedFaultFile(csvPath: string) {
  console.log(`📁 Processing ${path.basename(csvPath)}...`);
  
  const txt = await fs.readFile(csvPath, 'utf8');
  const rows = parse(txt, { columns: true, skip_empty_lines: true });
  
  if (!rows.length) return { brand: 'unknown', inserted: 0 };
  
  const brand = String(rows[0].brand || '').trim().toLowerCase();
  if (!brand) throw new Error(`Brand missing in ${path.basename(csvPath)}`);

  // Replace-by-brand: clear existing data for this brand
  console.log(`🗑️  Clearing existing ${brand} fault codes...`);
  const del = await supabase.from('fault_codes').delete().eq('brand_slug', brand);
  if (del.error) {
    if (del.error.message.includes('relation') && del.error.message.includes('does not exist')) {
      console.log(`ℹ️  fault_codes table doesn't exist yet - will create records when table is available`);
      return { brand, inserted: 0, tableExists: false };
    }
    console.warn(`Warning: Could not delete existing ${brand} codes:`, del.error.message);
  }

  // Transform CSV rows to database format
  const payload = rows.map((r: any) => ({
    brand_slug: String(r.brand).trim().toLowerCase(),
    model_pattern: (r.model_pattern ?? '').trim() || null,
    code: String(r.code).trim(),
    description: r.title ?? null,
    category: null, // Will be categorized later if needed
    severity: (r.severity ?? 'fault').toLowerCase(),
    solution: r.meaning ?? null,
    manual_reference: r.provenance ?? null,
    source_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  // Insert in chunks for reliability
  const chunkSize = 500;
  let inserted = 0;
  
  for (let i = 0; i < payload.length; i += chunkSize) {
    const chunk = payload.slice(i, i + chunkSize);
    const ins = await supabase.from('fault_codes').insert(chunk);
    
    if (ins.error) {
      if (ins.error.message.includes('relation') && ins.error.message.includes('does not exist')) {
        console.log(`ℹ️  fault_codes table doesn't exist yet - ready to seed when table is created`);
        return { brand, inserted: 0, tableExists: false };
      }
      console.error(`Error inserting ${brand} fault codes:`, ins.error.message);
      throw ins.error;
    }
    
    inserted += chunk.length;
    console.log(`  ✓ Inserted ${chunk.length} ${brand} fault codes`);
  }
  
  return { brand, inserted };
}

async function seedRetrieval(csvPath: string) {
  console.log(`📋 Processing ${path.basename(csvPath)}...`);
  
  const txt = await fs.readFile(csvPath, 'utf8');
  const rows = parse(txt, { columns: true, skip_empty_lines: true });
  
  // For now, we'll store retrieval steps in a simple way
  // Since we don't have svc.svc_code_retrieval table yet, we'll just log them
  console.log('📝 Retrieval steps found:');
  
  const brandSteps: Record<string, string[]> = {};
  
  for (const row of rows) {
    const brand = String(row.brand).trim().toLowerCase();
    const modelPattern = row.model_pattern ? String(row.model_pattern).trim() : 'generic';
    const steps = String(row.steps).trim();
    
    if (!brandSteps[brand]) brandSteps[brand] = [];
    brandSteps[brand].push(`${modelPattern}: ${steps}`);
  }
  
  for (const [brand, steps] of Object.entries(brandSteps)) {
    console.log(`  🔧 ${brand.toUpperCase()}:`);
    steps.forEach(step => console.log(`    - ${step}`));
  }
  
  return { brands: Object.keys(brandSteps), steps: rows.length };
}

async function main() {
  console.log('🚀 Starting fault code seeding from', DATA_DIR);
  console.log('');
  
  try {
    const entries = await fs.readdir(DATA_DIR);
    const files = entries.filter(f => f.endsWith('.csv'));
    const retrievalPath = files.find(f => f.toLowerCase() === 'retrieval.csv');
    const faultFiles = files.filter(f => f !== retrievalPath);

    let total = 0;
    const results: any[] = [];

    // Process fault code files
    for (const f of faultFiles) {
      const r = await seedFaultFile(path.join(DATA_DIR, f));
      results.push(r);
      total += r.inserted;
    }

    // Process retrieval steps
    if (retrievalPath) {
      const r = await seedRetrieval(path.join(DATA_DIR, retrievalPath));
      console.log(`\n📋 Retrieval steps: ${r.steps} entries across ${r.brands.length} brands`);
    }

    console.log('\n📊 Seeding Summary:');
    console.table(results);
    
    const tablesExist = results.some(r => r.tableExists !== false);
    
    if (tablesExist) {
      console.log(`\n✅ Complete! Inserted ${total} fault code rows.`);
      
      // Verification query suggestion
      console.log('\n🔍 Verify with:');
      console.log('   SELECT brand_slug, COUNT(*) FROM fault_codes GROUP BY brand_slug ORDER BY brand_slug;');
    } else {
      console.log(`\n📋 Ready to seed! ${results.length} brands prepared with fault code data.`);
      console.log('ℹ️  Run this seeder again after creating the fault_codes table.');
      console.log('\n📁 CSV files processed:');
      results.forEach(r => {
        const csvPath = path.join(DATA_DIR, `${r.brand}.csv`);
        const csv = fsSync.readFileSync(csvPath, 'utf8');
        const rows = parse(csv, { columns: true, skip_empty_lines: true });
        console.log(`   - ${r.brand}.csv: ${rows.length} fault codes ready`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();