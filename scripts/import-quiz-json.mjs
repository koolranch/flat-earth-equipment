import dotenv from 'dotenv';
// Load from .env.local as per project convention
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import crypto from 'node:crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Missing env');
const svc = createClient(url, key);

function hash(x){ return crypto.createHash('sha256').update(JSON.stringify({m:x.module_slug,l:x.locale,q:x.question,c:x.choices})).digest('hex'); }

const file = process.argv[2];
if (!file) throw new Error('Usage: node scripts/import-quiz-json.mjs ./seed.json');

console.log(`📂 Reading ${file}...`);
const data = JSON.parse(await readFile(file, 'utf8'));
console.log(`📋 Found ${data.length} items to import\n`);

let ok=0, skip=0, err=0;
for (const row of data){
  const h = hash(row);
  const { data: exists } = await svc.from('quiz_items').select('id').eq('content_hash', h).maybeSingle();
  if (exists){ 
    console.log(`⏭️  SKIP: ${row.question?.substring(0, 50)}... (duplicate)`);
    skip++; 
    continue; 
  }
  const ins = await svc.from('quiz_items').insert({ 
    ...row, 
    content_hash: h, 
    source: 'script',
    tags: row.tags || [],
    is_exam_candidate: row.is_exam_candidate ?? true,
    active: row.active ?? true
  }).select('id');
  if (ins.error){ 
    console.log(`❌ ERR: ${row.question?.substring(0, 50)}... - ${ins.error.message}`); 
    err++; 
  } else { 
    console.log(`✅ OK: ${row.question?.substring(0, 50)}...`);
    ok++; 
  }
}

console.log('\n🎯 Import Summary:');
console.log({ inserted: ok, skipped: skip, errors: err });
console.log(`\nTotal processed: ${data.length} items`);
if (err > 0) {
  console.log(`⚠️  ${err} items failed to import - check error messages above`);
}
if (skip > 0) {
  console.log(`ℹ️  ${skip} items skipped as duplicates`);
}
if (ok > 0) {
  console.log(`🎉 ${ok} items imported successfully`);
}
