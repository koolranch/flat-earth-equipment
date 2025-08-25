import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'faults');
const DRY_RUN = /--dry-run/.test(process.argv.join(' '));
const BRAND_ARG = (process.argv.find(a => a.startsWith('--brand=')) || '').split('=')[1];

function parseCsv(file: string) {
  const csv = fs.readFileSync(file, 'utf8');
  const { data, errors } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  if (errors?.length) {
    console.warn(`Papaparse warnings for ${path.basename(file)}`, errors.slice(0,3));
  }
  return data.filter(r => r && Object.keys(r).length > 0);
}

function toArray(field?: string | null) {
  if (!field) return null;
  const s = String(field).trim();
  if (!s) return null;
  // allow both '|' and ';' delimiters
  return s.split(/\s*[|;]\s*/).filter(Boolean);
}

type FaultRow = {
  brand: string; model_pattern?: string | null; code: string; title?: string | null; meaning?: string | null; severity?: 'info'|'warn'|'fault'|'stop'|string; likely_causes?: string | null; checks?: string | null; fixes?: string | null; provenance?: string | null;
};

async function seedFaultsForBrand(brand: string, rows: FaultRow[]) {
  const items = rows.map(r => ({
    brand: brand,
    model_pattern: r.model_pattern?.trim() || null,
    code: String(r.code).trim(),
    title: r.title?.trim() || null,
    meaning: r.meaning?.trim() || null,
    severity: (['info','warn','fault','stop'].includes(String(r.severity||'').toLowerCase()) ? String(r.severity).toLowerCase() : 'fault') as 'info'|'warn'|'fault'|'stop',
    likely_causes: toArray(r.likely_causes),
    checks: toArray(r.checks),
    fixes: toArray(r.fixes),
    provenance: r.provenance?.trim() || 'seed'
  }));

  console.log(`\n[${brand}] ${items.length} fault rows`);
  if (DRY_RUN) {
    console.log('DRY RUN — skipping DB writes');
    return;
  }

  // Replace-by-brand: delete then insert in chunks
  {
    const { error } = await supabase.from('svc_fault_codes').delete().eq('brand', brand);
    if (error) throw new Error(`[${brand}] delete failed: ${error.message}`);
  }

  const chunkSize = 400;
  for (let i=0; i<items.length; i+=chunkSize) {
    const chunk = items.slice(i, i+chunkSize);
    const { error } = await supabase.from('svc_fault_codes').insert(chunk, { returning: 'minimal' });
    if (error) throw new Error(`[${brand}] insert chunk failed: ${error.message}`);
    console.log(`[${brand}] inserted ${Math.min(i+chunkSize, items.length)}/${items.length}`);
  }
}

async function seedRetrieval(brand: string, rows: { brand: string; model_pattern?: string | null; steps: string }[]) {
  const items = rows.map(r => ({ brand, model_pattern: r.model_pattern?.trim() || null, steps: String(r.steps||'').trim() }));
  console.log(`\n[${brand}] ${items.length} retrieval rows`);
  if (DRY_RUN) {
    console.log('DRY RUN — skipping DB writes');
    return;
  }
  {
    const { error } = await supabase.from('svc_code_retrieval').delete().eq('brand', brand);
    if (error) throw new Error(`[${brand}] delete retrieval failed: ${error.message}`);
  }
  if (items.length) {
    const { error } = await supabase.from('svc_code_retrieval').insert(items, { returning: 'minimal' });
    if (error) throw new Error(`[${brand}] insert retrieval failed: ${error.message}`);
  }
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error('No data/faults directory found — nothing to seed.');
    process.exit(1);
  }
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.csv'));
  const retrievalFile = files.find(f => f.toLowerCase() === 'retrieval.csv');
  const brandFiles = files.filter(f => f !== retrievalFile);

  // Load brand faults
  const brandBuckets = new Map<string, FaultRow[]>();
  for (const file of brandFiles) {
    const abs = path.join(DATA_DIR, file);
    const rows = parseCsv(abs) as any as FaultRow[];
    for (const row of rows) {
      const brand = (row.brand || '').trim().toLowerCase();
      if (!brand) continue;
      if (BRAND_ARG && brand !== BRAND_ARG.toLowerCase()) continue;
      if (!brandBuckets.has(brand)) brandBuckets.set(brand, []);
      brandBuckets.get(brand)!.push(row);
    }
  }

  // Seed faults per brand
  for (const [brand, rows] of brandBuckets) {
    await seedFaultsForBrand(brand, rows);
  }

  // Seed retrieval steps
  if (retrievalFile) {
    const abs = path.join(DATA_DIR, retrievalFile);
    const rows = parseCsv(abs) as any as { brand: string; model_pattern?: string; steps: string }[];
    const byBrand = new Map<string, { brand: string; model_pattern?: string; steps: string }[]>();
    for (const r of rows) {
      const b = (r.brand || '').trim().toLowerCase();
      if (!b) continue;
      if (BRAND_ARG && b !== BRAND_ARG.toLowerCase()) continue;
      if (!byBrand.has(b)) byBrand.set(b, []);
      byBrand.get(b)!.push(r);
    }
    for (const [brand, list] of byBrand) {
      await seedRetrieval(brand, list);
    }
  }
  console.log('\nDone.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});