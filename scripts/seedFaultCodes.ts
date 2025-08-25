import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

/**
 * Usage:
 *  pnpm tsx scripts/seedFaultCodes.ts --brand=yale
 *  pnpm tsx scripts/seedFaultCodes.ts --brand=all --validate-only
 *  pnpm tsx scripts/seedFaultCodes.ts --brand=crown --dry-run
 *
 * Reads data/faults/<brand>.csv and data/faults/retrieval-<brand>.csv
 * Tables (already exist): public.svc_fault_codes, public.svc_code_retrieval
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'faults');

function parseArgs(){
  const args = process.argv.slice(2);
  const out: any = { brand: 'all', dryRun: false, validateOnly: false, replace: true };
  for (const a of args){
    if (a.startsWith('--brand=')) out.brand = a.split('=')[1];
    if (a === '--dry-run') out.dryRun = true;
    if (a === '--validate-only') out.validateOnly = true;
    if (a === '--no-replace') out.replace = false;
  }
  return out;
}

function csvPath(brand: string){
  return path.join(DATA_DIR, `${brand}.csv`);
}
function retrievalPath(brand: string){
  return path.join(DATA_DIR, `retrieval-${brand}.csv`);
}

function loadCsv(p: string){
  if (!fs.existsSync(p)) return [];
  const txt = fs.readFileSync(p, 'utf8');
  const { data } = Papa.parse(txt, { header: true, skipEmptyLines: true });
  return data as any[];
}

function validateFaultRow(row: any){
  const required = ['brand','code','title'];
  for (const k of required){ if (!row[k] || String(row[k]).trim()==='') return `Missing required: ${k}`; }
  if (row.common_causes && typeof row.common_causes === 'string'){ row.common_causes = row.common_causes.split(/[|;]\s*/).filter(Boolean); }
  if (row.steps && typeof row.steps === 'string'){ row.steps = row.steps.split(/[|;]\s*/).filter(Boolean); }
  if (row.models && typeof row.models === 'string'){ row.models = row.models.split(/[|;]\s*/).filter(Boolean); }
  return null;
}

function validateRetrievalRow(row: any){
  const required = ['brand','method','steps'];
  for (const k of required){ if (!row[k] || String(row[k]).trim()==='') return `Missing required: ${k}`; }
  if (typeof row.steps === 'string'){ row.steps = row.steps.split(/[|;]\s*/).filter(Boolean); }
  return null;
}

async function replaceBrand(brand: string){
  if (!supabase) throw new Error('Supabase client not initialized');
  // Hard delete existing brand slice (safe because we only seed public svc_* tables)
  await supabase.from('svc_fault_codes').delete().eq('brand', brand);
  await supabase.from('svc_code_retrieval').delete().eq('brand', brand);
}

async function upsertFaults(brand: string, rows: any[]){
  if (!supabase) throw new Error('Supabase client not initialized');
  if (!rows.length) return;
  const chunks = [];
  const size = 400;
  for (let i=0; i<rows.length; i+=size){ chunks.push(rows.slice(i, i+size)); }
  for (const c of chunks){
    const { error } = await supabase.from('svc_fault_codes').upsert(c, { onConflict: 'brand,code' });
    if (error) throw error;
  }
}

async function upsertRetrieval(brand: string, rows: any[]){
  if (!supabase) throw new Error('Supabase client not initialized');
  if (!rows.length) return;
  const chunks = [];
  const size = 400;
  for (let i=0; i<rows.length; i+=size){ chunks.push(rows.slice(i, i+size)); }
  for (const c of chunks){
    const { error } = await supabase.from('svc_code_retrieval').upsert(c, { onConflict: 'brand,method' });
    if (error) throw error;
  }
}

async function run(){
  const { brand, dryRun, validateOnly, replace } = parseArgs();
  
  if (!validateOnly && !supabase) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    process.exit(1);
  }
  
  if (!fs.existsSync(DATA_DIR)) {
    console.log('No data/faults directory found');
    return;
  }
  
  const brands = brand === 'all'
    ? fs.readdirSync(DATA_DIR).filter(f=>f.endsWith('.csv') && !f.startsWith('retrieval') && f !== 'README.md').map(f=>f.replace(/\.csv$/,''))
    : [brand];
  console.log('Brands to process:', brands.join(', '));

  for (const b of brands){
    const faults = loadCsv(csvPath(b));
    const retrieval = loadCsv(retrievalPath(b));

    let errors: string[] = [];
    faults.forEach((r,i)=>{ const e = validateFaultRow(r); if (e) errors.push(`faults[${i}]: ${e}`); });
    retrieval.forEach((r,i)=>{ const e = validateRetrievalRow(r); if (e) errors.push(`retrieval[${i}]: ${e}`); });
    if (errors.length){
      console.error(`Validation errors for ${b}:\n` + errors.join('\n'));
      process.exitCode = 1;
      continue;
    }

    console.log(`[${b}] ${faults.length} faults, ${retrieval.length} retrieval steps`);
    if (validateOnly){ console.log(`[${b}] validate-only: OK`); continue; }
    if (dryRun){ console.log(`[${b}] dry-run: would ${replace?'replace and ':''}upsert rows now`); continue; }

    if (replace){ console.log(`[${b}] replacing existing brand slice...`); await replaceBrand(b); }
    await upsertFaults(b, faults);
    await upsertRetrieval(b, retrieval);
    console.log(`[${b}] done.`);
  }
}

run().catch(e=>{ console.error(e); process.exit(1); });
