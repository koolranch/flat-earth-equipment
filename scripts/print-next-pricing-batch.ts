/**
 * Print the next N quote-only parts ready for Magnasource comp pricing.
 *
 * Usage:
 *   npx tsx scripts/print-next-pricing-batch.ts
 *   npx tsx scripts/print-next-pricing-batch.ts --limit 10 --brand Caterpillar
 *   npx tsx scripts/print-next-pricing-batch.ts --source tvh
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { allCompUrls, primaryCompUrl } from '../lib/pricing/compSources';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE = 'https://www.flatearthequipment.com';

function parseArgs() {
  const args = process.argv.slice(2);
  let limit = 10;
  let brand: string | undefined;
  let source: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) limit = parseInt(args[++i], 10);
    if (args[i] === '--brand' && args[i + 1]) brand = args[++i];
    if (args[i] === '--source' && args[i + 1]) source = args[++i];
  }

  return { limit, brand, source };
}

function matchesSource(metadata: Record<string, unknown> | null, filter?: string): boolean {
  if (!filter) return true;
  const src = String(metadata?.source ?? metadata?.vendor_supply_chain ?? '');
  return src.toLowerCase().includes(filter.toLowerCase());
}

async function main() {
  const { limit, brand, source } = parseArgs();

  let query = supabase
    .from('parts')
    .select('sku, slug, name, brand, oem_reference, category, metadata')
    .eq('sales_type', 'quote_only')
    .is('stripe_price_id', null)
    .order('brand')
    .order('oem_reference')
    .limit(limit * 3);

  if (brand) query = query.eq('brand', brand);

  const { data: parts, error } = await query;
  if (error) throw error;

  const eligible = (parts ?? [])
    .filter((p) => matchesSource(p.metadata as Record<string, unknown>, source))
    .slice(0, limit);

  console.log(`\n📋 Next ${eligible.length} parts for comp pricing${brand ? ` (${brand})` : ''}${source ? ` [source~${source}]` : ''}\n`);
  console.log('Paste comp prices back as: 1: $xxx, 2: $yyy, …\n');

  eligible.forEach((p, i) => {
    const oem = p.oem_reference ?? p.sku;
    console.log(`${i + 1}. ${p.brand} ${oem} — ${p.name}`);
    console.log(`   Site:  ${SITE}/parts/${p.slug}`);
    console.log(`   Comp:  ${primaryCompUrl(oem, p.brand)}`);
    const extras = allCompUrls(oem, p.brand).filter((u) => !u.url.includes('magnasource'));
    for (const ex of extras.slice(0, 1)) {
      console.log(`   Alt:   ${ex.url} (${ex.source})`);
    }
    console.log('');
  });

  console.log('Then run: npx tsx scripts/sync-priced-batch.ts --file data/pricing/batch-NN.json');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
