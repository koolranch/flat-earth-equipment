/**
 * Insert Rough Terrain scissor Phase 1 quote_only stubs from net-new intake.
 *
 * Usage:
 *   npx tsx scripts/aerial/add-rt-scissor-phase1.ts --dry-run
 *   npx tsx scripts/aerial/add-rt-scissor-phase1.ts
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
  category: string;
  category_bucket: string;
  compatible_models: string[];
  sn_from: string | null;
  sn_to: string | null;
  qty: string | null;
  notes: string | null;
  phase: string;
  publish_status: string;
  slug: string;
};

function categoryFor(row: IntakeRow): { category: string; category_slug: string } {
  switch (row.category_bucket) {
    case 'controllers':
      return { category: 'Joysticks & Controls', category_slug: 'controls' };
    case 'switches':
    case 'sensors':
      return { category: 'Switches & Sensors', category_slug: 'switches' };
    case 'relays':
    case 'fuses':
      return { category: 'Switches & Electrical', category_slug: 'electrical' };
    case 'accessories': {
      if (/strobe|light|flashing|rotating/i.test(row.description)) {
        return { category: 'Lighting', category_slug: 'lighting' };
      }
      return { category: 'Safety & Alarms', category_slug: 'safety' };
    }
    default:
      return { category: 'Switches & Electrical', category_slug: 'electrical' };
  }
}

function buildName(row: IntakeRow): string {
  return `${row.brand} ${row.oem_display} ${row.description}`;
}

function buildDescription(row: IntakeRow): string {
  const models =
    row.compatible_models.length > 0
      ? ` Fits ${row.brand} rough-terrain scissor models including ${row.compatible_models.join(', ')}.`
      : '';
  const sn =
    row.sn_from && row.sn_to
      ? ` Serial range guidance in listing notes (verify before ordering).`
      : '';

  return [
    `Aftermarket ${row.description.toLowerCase()} for ${row.brand} rough-terrain scissor lifts.`,
    `Direct replacement for OEM part number ${row.oem_display}.${models}`,
    'Confirm machine model and serial break before ordering.',
    sn,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeOemKey(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const intakePath = path.resolve(
    process.cwd(),
    'data/aerial/rt-scissor-phase1-net-new.json'
  );
  if (!fs.existsSync(intakePath)) {
    console.error('Missing phase1 net-new file. Run: npx tsx scripts/aerial/build-rt-scissor-intake.ts --dedupe');
    process.exit(1);
  }

  const candidates: IntakeRow[] = JSON.parse(fs.readFileSync(intakePath, 'utf8'));
  console.log(
    `RT scissor Phase 1 — ${candidates.length} net-new candidates${dryRun ? ' [DRY RUN]' : ''}\n`
  );

  const { data: existingParts, error: existingErr } = await supabase
    .from('parts')
    .select('slug, sku, oem_reference, brand, metadata');

  if (existingErr) {
    console.error('Failed to load existing parts:', existingErr.message);
    process.exit(1);
  }

  const existingSlugs = new Set((existingParts ?? []).map((p) => p.slug));
  const existingSkus = new Set((existingParts ?? []).map((p) => p.sku));
  const existingOem = new Set<string>();
  const existingVendor = new Set<string>();

  for (const p of existingParts ?? []) {
    const oem = (p.oem_reference || '').trim();
    if (oem) {
      existingOem.add(normalizeOemKey(oem));
      existingOem.add(normalizeOemKey(stripVendorCatalogPrefix(oem, p.brand)));
    }
    const meta = (p.metadata ?? {}) as Record<string, unknown>;
    const vendor = String(meta.vendor_pn || meta.vendor_sku || '').trim();
    if (vendor) existingVendor.add(normalizeOemKey(vendor));
    if (p.sku) existingSkus.add(p.sku);
  }

  const toInsert: Record<string, unknown>[] = [];
  let skipped = 0;

  for (const row of candidates) {
    const oemDisplay = stripVendorCatalogPrefix(row.vendor_pn, row.brand) || row.oem_display;
    const slug = row.slug;
    const sku = slug;

    if (
      existingSlugs.has(slug) ||
      existingSkus.has(sku) ||
      existingOem.has(normalizeOemKey(oemDisplay)) ||
      existingVendor.has(normalizeOemKey(row.vendor_pn))
    ) {
      skipped += 1;
      console.log(`  skip ${row.vendor_pn} (already exists)`);
      continue;
    }

    const { category, category_slug } = categoryFor(row);
    const insertRow = {
      name: buildName({ ...row, oem_display: oemDisplay }),
      slug,
      sku,
      oem_reference: oemDisplay,
      brand: row.brand,
      category,
      category_slug,
      description: buildDescription({ ...row, oem_display: oemDisplay }),
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
        category_bucket: row.category_bucket,
        qrg_category: row.category,
        phase: '1',
        sn_from: row.sn_from,
        sn_to: row.sn_to,
        notes: row.notes,
        machine_class: 'rough_terrain_scissor',
      },
    };

    toInsert.push(insertRow);
    existingSlugs.add(slug);
    existingSkus.add(sku);
    existingOem.add(normalizeOemKey(oemDisplay));
    existingVendor.add(normalizeOemKey(row.vendor_pn));
  }

  console.log(`\nPrepared ${toInsert.length} inserts (skipped ${skipped}).`);

  if (dryRun) {
    console.log(
      'Dry run sample:',
      toInsert.slice(0, 5).map((r) => ({
        slug: r.slug,
        brand: r.brand,
        oem: r.oem_reference,
        category_slug: r.category_slug,
      }))
    );
    return;
  }

  if (toInsert.length === 0) {
    console.log('Nothing to insert.');
    return;
  }

  const BATCH = 40;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error } = await supabase.from('parts').insert(batch);
    if (error) {
      console.error(`Batch insert failed at ${i}:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`Inserted ${inserted}/${toInsert.length}`);
  }

  console.log(`\nDone. Inserted ${inserted} RT scissor Phase 1 quote_only stubs.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
