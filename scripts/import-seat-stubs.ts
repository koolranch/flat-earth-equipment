/**
 * Phase 1: Import parsed seat guide products as quote-only SEO stubs.
 *
 * Prerequisites: run `npx tsx scripts/parse-seat-guide.ts` first.
 *
 * Usage:
 *   npx tsx scripts/import-seat-stubs.ts
 *   npx tsx scripts/import-seat-stubs.ts --dry-run
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import type { SeatProductRecord } from '../lib/seats/types';
import { isValidOemPartNumber } from '../lib/seats/buildSeatProduct';
import { stripVendorCatalogPrefix } from '../lib/parts/vendorOemPrefix';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JSON_PATH = path.resolve(process.cwd(), 'data/seats/seat-products.json');

function toPartRow(item: SeatProductRecord) {
  const customerOem = stripVendorCatalogPrefix(item.oem_part_number, item.brand);

  return {
    name: item.name,
    slug: item.slug,
    sku: item.sku,
    oem_reference: customerOem,
    brand: item.brand,
    category: item.category,
    category_slug: item.category_slug,
    description: item.description,
    price: 0,
    price_cents: 0,
    sales_type: 'quote_only' as const,
    is_in_stock: false,
    compatible_models: item.compatible_models,
    image_url: null,
    metadata: {
      oem_pn: customerOem,
      vendor_catalog_pn: item.oem_part_number,
      product_type: item.product_type,
      section: item.section,
      dimensions: item.dimensions ?? null,
      material: item.material ?? null,
      has_seat_adjusters: item.has_seat_adjusters ?? null,
      has_seat_switch: item.has_seat_switch ?? null,
      replacement_back_cushion: item.replacement_back_cushion ?? null,
      replacement_bottom_cushion: item.replacement_bottom_cushion ?? null,
      related_oem_parts: item.related_oem_parts,
      source: 'industrial_seat_guide_v1',
    },
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  if (!fs.existsSync(JSON_PATH)) {
    console.error(`Missing ${JSON_PATH} — run parse-seat-guide.ts first.`);
    process.exit(1);
  }

  const products: SeatProductRecord[] = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  console.log(`🚀 Importing ${products.length} seat products (${dryRun ? 'DRY RUN' : 'LIVE'})...\n`);

  const { data: existingParts, error: fetchError } = await supabase
    .from('parts')
    .select('slug, sku');

  if (fetchError) {
    console.error('❌ Failed to fetch existing parts:', fetchError.message);
    process.exit(1);
  }

  const existingSlugs = new Set(existingParts?.map((p) => p.slug) ?? []);
  const existingSkus = new Set(existingParts?.map((p) => p.sku) ?? []);

  // Dedupe by normalized SKU before import (handles slash/dash variants).
  const deduped = new Map<string, ReturnType<typeof toPartRow>>();
  for (const item of products.filter((p) => isValidOemPartNumber(p.oem_part_number))) {
    const row = toPartRow(item);
    deduped.set(row.sku, row);
  }
  const newParts = [...deduped.values()].filter(
    (p) => !existingSlugs.has(p.slug) && !existingSkus.has(p.sku)
  );

  const skipped = products.length - newParts.length;
  console.log(`📦 Prepared ${newParts.length} new stubs (${skipped} already exist).`);

  if (dryRun) {
    console.log('\nSample rows:');
    for (const row of newParts.slice(0, 5)) {
      console.log(`  ${row.brand} | ${row.oem_reference} | ${row.slug}`);
    }
    return;
  }

  const BATCH_SIZE = 100;
  let totalInserted = 0;

  for (let i = 0; i < newParts.length; i += BATCH_SIZE) {
    const batch = newParts.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('parts').insert(batch);
    if (error) {
      console.error(`❌ Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
    } else {
      totalInserted += batch.length;
      console.log(`✅ Inserted ${totalInserted}/${newParts.length}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('SEAT STUB IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`Added: ${totalInserted}`);
  console.log(`Skipped duplicates: ${skipped}`);
}

main().catch((e) => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});
