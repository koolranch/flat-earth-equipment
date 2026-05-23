/**
 * Print the next hub-priority seat batch for Magnasource comp pricing.
 * No TVH cost lookups required — comp-only provisional pricing is supported.
 *
 * Usage:
 *   npx tsx scripts/print-hub-pricing-batch.ts
 *   npx tsx scripts/print-hub-pricing-batch.ts --limit 10
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { SEAT_MODEL_HUBS } from '../constants/seatModelHubs';
import { primaryCompUrl } from '../lib/pricing/compSources';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE = 'https://www.flatearthequipment.com';
const PRIORITY_BRANDS = ['Caterpillar', 'JLG', 'Genie', 'JCB', 'Skytrack', 'Bobcat', 'Toyota', 'Hyster'];

function parseLimit(): number {
  const idx = process.argv.indexOf('--limit');
  return idx !== -1 && process.argv[idx + 1] ? parseInt(process.argv[idx + 1], 10) : 10;
}

async function main() {
  const limit = parseLimit();
  const hubOems = new Set(
    SEAT_MODEL_HUBS.flatMap((h) => [h.primaryAssemblyOem, h.primaryCushionOem].filter(Boolean) as string[])
  );

  const seatJsonPath = path.resolve(process.cwd(), 'data/seats/seat-products.json');
  const products = JSON.parse(fs.readFileSync(seatJsonPath, 'utf8')) as Array<{
    sku: string;
    oem_part_number: string;
    brand: string;
    product_type: string;
    compatible_models?: string[];
  }>;

  const fitmentByOem = new Map<string, number>();
  for (const p of products) {
    fitmentByOem.set(p.oem_part_number, p.compatible_models?.length ?? 0);
  }

  const { data: parts, error } = await supabase
    .from('parts')
    .select('sku, slug, name, brand, oem_reference, category, sales_type, metadata')
    .in('category', ['Seats', 'Seat cushions'])
    .eq('sales_type', 'quote_only')
    .order('brand');

  if (error) throw error;

  const ranked = (parts ?? [])
    .filter((p) => PRIORITY_BRANDS.includes(p.brand))
    .filter((p) => !(p.metadata as Record<string, unknown>)?.backordered)
    .map((p) => {
      const oem = p.oem_reference ?? p.sku;
      const isHub = hubOems.has(oem);
      const isAssembly = p.category === 'Seats';
      const fitment = fitmentByOem.get(oem) ?? 0;
      const hub = SEAT_MODEL_HUBS.find((h) => h.primaryAssemblyOem === oem || h.primaryCushionOem === oem);
      return { part: p, oem, isHub, isAssembly, fitment, hubSlug: hub?.slug };
    })
    .sort((a, b) => {
      if (a.isHub !== b.isHub) return a.isHub ? -1 : 1;
      if (a.isAssembly !== b.isAssembly) return a.isAssembly ? -1 : 1;
      if (b.fitment !== a.fitment) return b.fitment - a.fitment;
      return PRIORITY_BRANDS.indexOf(a.part.brand) - PRIORITY_BRANDS.indexOf(b.part.brand);
    })
    .slice(0, limit);

  console.log(`\n🎯 Hub-priority batch (${ranked.length} SKUs) — Magnasource comps only, no TVH cost needed\n`);
  console.log('Reply with comp prices only, e.g.: 1: $420  2: NA  3: $580\n');

  ranked.forEach(({ part, oem, isHub, fitment, hubSlug }, i) => {
    const flags = [isHub ? 'hub' : null, fitment ? `${fitment} models` : null, hubSlug].filter(Boolean);
    console.log(`${i + 1}. ${part.brand} ${oem} — ${part.name}${flags.length ? ` [${flags.join(', ')}]` : ''}`);
    console.log(`   Magnasource: ${primaryCompUrl(oem, part.brand)}`);
    console.log(`   Site:        ${SITE}/parts/${part.slug}`);
    console.log('');
  });

  console.log('Optional: add your TVH cost only when you already have it (1–2 SKUs), not bulk lookups.');
  console.log('Then: npx tsx scripts/sync-priced-batch.ts --file data/pricing/hub-batch-NN.json\n');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
