/**
 * Phase 2 helper: Print the next 10 eligible JCB parts for manual competitor pricing.
 *
 * - Excludes SKUs already used in prior batch scripts (pilot + batch 2-6)
 * - Filters to JCB parts that are still quote_only and have no stripe_price_id
 * - Prints Magnasource itemdetail URLs WITHOUT the "jc" prefix
 *
 * Run with: npx tsx scripts/print-next-jcb-batch.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function extractSkusFromScriptText(text: string): string[] {
  // Matches: { sku: "..." } or { sku: '...' }
  const re = /\bsku:\s*["']([^"']+)["']/g;
  const skus: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    skus.push(match[1]);
  }
  return skus;
}

function toMagnasourceId(raw: string): string {
  // Magnasource URLs in our workflow use the OEM reference without "jc" prefix.
  // Also strip separators like "/" and "-" and spaces.
  return raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

async function main() {
  const scriptPaths = [
    'scripts/sync-jcb-pilot-prices.ts',
    'scripts/sync-jcb-batch-2.ts',
    'scripts/sync-jcb-batch-3.ts',
    'scripts/sync-jcb-batch-4.ts',
    'scripts/sync-jcb-batch-5.ts',
    'scripts/sync-jcb-batch-6.ts',
    'scripts/sync-jcb-batch-7.ts',
    'scripts/sync-jcb-batch-8.ts',
    'scripts/sync-jcb-batch-9.ts',
    'scripts/sync-jcb-batch-10.ts',
    'scripts/sync-jcb-batch-11.ts',
    'scripts/sync-jcb-batch-12.ts',
    'scripts/sync-jcb-batch-13.ts',
    'scripts/sync-jcb-batch-14.ts',
    'scripts/sync-jcb-batch-15.ts',
    'scripts/sync-jcb-batch-16.ts',
    'scripts/sync-jcb-batch-17.ts',
    'scripts/sync-jcb-batch-18.ts',
    'scripts/sync-jcb-batch-19.ts',
    'scripts/sync-jcb-batch-20.ts',
    'scripts/sync-jcb-batch-21.ts'
  ].map((p) => path.resolve(process.cwd(), p));

  const excludeSkus = new Set<string>([
    // Manually removed parts (NA - remove from website)
    '128-F5310', '128G2288', '17914200',
    '191-00606', '20-202900-R', '20203200',
    '20908700', '20925510', '20-925723', '20951276', '25201901',
    '25220595', '25222619',
    '25957201', '27400859',
    '32006082', '32006157',
    '32006828', '320A7008'
  ]);
  for (const p of scriptPaths) {
    try {
      const txt = fs.readFileSync(p, 'utf8');
      for (const sku of extractSkusFromScriptText(txt)) excludeSkus.add(sku);
    } catch {
      // If a file doesn't exist, just ignore it.
    }
  }

  const picked: Array<{
    id: string;
    sku: string;
    slug: string;
    oem_reference: string | null;
    name: string;
  }> = [];

  const PAGE_SIZE = 200;
  for (let page = 0; page < 50 && picked.length < 10; page++) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('parts')
      .select('id,sku,slug,oem_reference,name,sales_type,stripe_price_id')
      .eq('brand', 'JCB')
      .eq('sales_type', 'quote_only')
      .is('stripe_price_id', null)
      .order('slug', { ascending: true })
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data as any[]) {
      if (picked.length >= 10) break;
      if (!row?.sku || !row?.slug) continue;
      if (excludeSkus.has(row.sku)) continue;
      picked.push({
        id: row.id,
        sku: row.sku,
        slug: row.slug,
        oem_reference: row.oem_reference ?? null,
        name: row.name
      });
    }
  }

  if (picked.length === 0) {
    console.log('No eligible JCB parts found (quote_only + no stripe_price_id) that were not already used in prior batches.');
    return;
  }

  console.log('Next batch (10) - send back competitor prices in order:\n');
  picked.forEach((p, idx) => {
    const ref = p.oem_reference || p.sku;
    const magnasourceId = toMagnasourceId(ref);
    console.log(`${idx + 1}: ${p.sku}`);
    console.log(`   OEM ref: ${p.oem_reference ?? '(none)'}`);
    console.log(`   Name: ${p.name}`);
    console.log(`   Magnasource: https://magnasourceinc.com/itemdetail/${magnasourceId}`);
    console.log(`   Your site: https://www.flatearthequipment.com/parts/${p.slug}\n`);
  });

  console.log('Reply format:');
  console.log(picked.map((_, i) => `${i + 1}: $0.00`).join(', '));
  console.log('(Use NA if not found.)');
}

main().catch((e) => {
  console.error('Fatal:', e?.message || e);
  process.exit(1);
});

