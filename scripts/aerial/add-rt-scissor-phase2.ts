/**
 * Insert Rough Terrain scissor Phase 2 (valves) quote_only stubs.
 *
 * Usage:
 *   npx tsx scripts/aerial/add-rt-scissor-phase2.ts --dry-run
 *   npx tsx scripts/aerial/add-rt-scissor-phase2.ts
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { stripVendorCatalogPrefix } from '../../lib/parts/vendorOemPrefix';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type IntakeRow = {
  vendor_pn: string;
  brand: string;
  oem_display: string;
  description: string;
  category_bucket: string;
  compatible_models: string[];
  sn_from: string | null;
  sn_to: string | null;
  notes: string | null;
  phase: string;
  publish_status: string;
  slug: string;
};

function normalizeOemKey(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const intakePath = path.resolve(process.cwd(), 'data/aerial/rt-scissor-intake.json');
  const intake: IntakeRow[] = JSON.parse(fs.readFileSync(intakePath, 'utf8'));
  const candidates = intake.filter(
    (r) => r.phase === '2' && r.publish_status === 'pending' && r.category_bucket === 'valves'
  );

  console.log(`RT scissor Phase 2 valves — ${candidates.length} candidates${dryRun ? ' [DRY RUN]' : ''}\n`);

  const { data: existingParts, error } = await supabase
    .from('parts')
    .select('slug, sku, oem_reference, brand, metadata');
  if (error) throw error;

  const existingSlugs = new Set((existingParts ?? []).map((p) => p.slug));
  const existingSkus = new Set((existingParts ?? []).map((p) => p.sku));
  const existingOem = new Set<string>();
  const existingVendor = new Set<string>();
  for (const p of existingParts ?? []) {
    if (p.oem_reference) {
      existingOem.add(normalizeOemKey(p.oem_reference));
      existingOem.add(normalizeOemKey(stripVendorCatalogPrefix(p.oem_reference, p.brand)));
    }
    const vendor = String((p.metadata as Record<string, unknown> | null)?.vendor_pn || '').trim();
    if (vendor) existingVendor.add(normalizeOemKey(vendor));
  }

  const toInsert: Record<string, unknown>[] = [];
  let skipped = 0;

  for (const row of candidates) {
    const oemDisplay = stripVendorCatalogPrefix(row.vendor_pn, row.brand) || row.oem_display;
    if (
      existingSlugs.has(row.slug) ||
      existingSkus.has(row.slug) ||
      existingOem.has(normalizeOemKey(oemDisplay)) ||
      existingVendor.has(normalizeOemKey(row.vendor_pn))
    ) {
      skipped += 1;
      console.log(`  skip ${row.vendor_pn}`);
      continue;
    }

    const models =
      row.compatible_models.length > 0
        ? ` Fits ${row.brand} rough-terrain scissor models including ${row.compatible_models.join(', ')}.`
        : '';

    toInsert.push({
      name: `${row.brand} ${oemDisplay} ${row.description}`,
      slug: row.slug,
      sku: row.slug,
      oem_reference: oemDisplay,
      brand: row.brand,
      category: 'Hydraulics',
      category_slug: 'hydraulics',
      description: [
        `Aftermarket ${row.description.toLowerCase()} for ${row.brand} rough-terrain scissor lifts.`,
        `Direct replacement for OEM part number ${oemDisplay}.${models}`,
        'Confirm machine model and serial break before ordering.',
      ].join(' '),
      price: 0,
      price_cents: 0,
      sales_type: 'quote_only',
      is_in_stock: false,
      image_url: null,
      compatible_models: row.compatible_models,
      metadata: {
        oem_pn: oemDisplay,
        vendor_pn: row.vendor_pn,
        source: 'rt_scissor_qrg_2003034',
        category_bucket: 'valves',
        phase: '2',
        sn_from: row.sn_from,
        sn_to: row.sn_to,
        notes: row.notes,
        machine_class: 'rough_terrain_scissor',
      },
    });

    existingSlugs.add(row.slug);
    existingOem.add(normalizeOemKey(oemDisplay));
    existingVendor.add(normalizeOemKey(row.vendor_pn));
  }

  console.log(`Prepared ${toInsert.length} inserts (skipped ${skipped}).`);
  if (dryRun) {
    console.log('Sample:', toInsert.slice(0, 4).map((r) => ({ slug: r.slug, oem: r.oem_reference })));
    return;
  }
  if (!toInsert.length) return;

  const BATCH = 40;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error: err } = await supabase.from('parts').insert(batch);
    if (err) {
      console.error(err.message);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`Inserted ${inserted}/${toInsert.length}`);
  }
  console.log(`\nDone. Inserted ${inserted} Phase 2 valve quote_only stubs.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
