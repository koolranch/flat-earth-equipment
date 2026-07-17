/**
 * Insert Brushes & Brooms Phase 1 quote_only stubs (main + side brooms
 * for Tennant / Advance / Power Boss) from net-new intake.
 *
 * Keys are vendor house numbers (SY11-*), not OEM PNs — do not claim OEM
 * equivalence in customer copy. Crosswalk before any Buy Now.
 *
 * Usage:
 *   npx tsx scripts/brooms/add-brooms-phase1.ts --dry-run
 *   npx tsx scripts/brooms/add-brooms-phase1.ts
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

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
  broom_type: string;
  broom_type_label: string;
  size_in: string | null;
  filament: string | null;
  pattern: string | null;
  compatible_models: string[];
  model_codes: string[];
  qty: string | null;
  notes: string | null;
  phase: string;
  publish_status: string;
  slug: string;
};

function normalizeKey(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function brandVendorKey(brand: string, vendorPn: string): string {
  return `${normalizeKey(brand)}::${normalizeKey(vendorPn)}`;
}

function sizePhrase(sizeIn: string | null): string | null {
  if (!sizeIn) return null;
  return sizeIn.replace(/"/g, ' in').replace(/\s+/g, ' ').trim();
}

function buildName(row: IntakeRow): string {
  const size = sizePhrase(row.size_in);
  const detail = [size, row.filament].filter(Boolean).join(' ');
  const paren = detail ? ` (${detail})` : '';
  return `${row.brand} ${row.oem_display} ${row.broom_type_label}${paren}`;
}

function buildDescription(row: IntakeRow): string {
  const models =
    row.compatible_models.length > 0
      ? ` Fits ${row.brand} sweeper models including ${row.compatible_models.slice(0, 12).join(', ')}${
          row.compatible_models.length > 12 ? ', and others' : ''
        }.`
      : '';

  return [
    `Aftermarket ${row.broom_type_label.toLowerCase()} for ${row.brand} floor sweepers.`,
    `Part number ${row.oem_display}.${models}`,
    'Confirm machine model and broom size before ordering.',
  ]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const intakePath = path.resolve(
    process.cwd(),
    'data/brooms/brooms-phase1-net-new.json'
  );
  if (!fs.existsSync(intakePath)) {
    console.error(
      'Missing phase1 net-new file. Run: npx tsx scripts/brooms/build-brooms-intake.ts --dedupe'
    );
    process.exit(1);
  }

  const candidates: IntakeRow[] = JSON.parse(fs.readFileSync(intakePath, 'utf8'));
  console.log(
    `Brooms Phase 1 — ${candidates.length} net-new candidates${dryRun ? ' [DRY RUN]' : ''}\n`
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
  const existingBrandVendor = new Set<string>();

  for (const p of existingParts ?? []) {
    const meta = (p.metadata ?? {}) as Record<string, unknown>;
    const vendor = String(meta.vendor_pn || meta.vendor_sku || meta.vendor_catalog_pn || '').trim();
    if (vendor && p.brand) {
      existingBrandVendor.add(brandVendorKey(p.brand, vendor));
      // Also key stripped SY → display form
      const stripped = vendor.replace(/^SYS?/i, '');
      if (stripped !== vendor) {
        existingBrandVendor.add(brandVendorKey(p.brand, stripped));
      }
    }
  }

  const toInsert: Record<string, unknown>[] = [];
  let skipped = 0;

  for (const row of candidates) {
    const slug = row.slug;
    const sku = slug;
    const bv = brandVendorKey(row.brand, row.vendor_pn);

    if (
      existingSlugs.has(slug) ||
      existingSkus.has(sku) ||
      existingBrandVendor.has(bv)
    ) {
      skipped += 1;
      console.log(`  skip ${row.brand} ${row.vendor_pn} (already exists)`);
      continue;
    }

    const insertRow = {
      name: buildName(row),
      slug,
      sku,
      oem_reference: row.oem_display,
      brand: row.brand,
      category: 'Brooms',
      category_slug: 'brooms',
      description: buildDescription(row),
      price: 0,
      price_cents: 0,
      sales_type: 'quote_only',
      is_in_stock: false,
      image_url: null,
      compatible_models: row.compatible_models,
      metadata: {
        oem_pn: row.oem_display,
        vendor_pn: row.vendor_pn,
        source: 'brooms_qrg_1903032',
        broom_type: row.broom_type,
        size_in: row.size_in,
        filament: row.filament,
        pattern: row.pattern,
        model_codes: row.model_codes,
        phase: '1',
        notes: row.notes,
        numbering: 'vendor_house',
        warranty_months: 12,
      },
    };

    toInsert.push(insertRow);
    existingSlugs.add(slug);
    existingSkus.add(sku);
    existingBrandVendor.add(bv);
  }

  console.log(`\nPrepared ${toInsert.length} inserts (skipped ${skipped}).`);

  if (dryRun) {
    console.log(
      'Dry run sample:',
      toInsert.slice(0, 5).map((r) => ({
        slug: r.slug,
        name: r.name,
        brand: r.brand,
        oem: r.oem_reference,
        models: (r.compatible_models as string[])?.slice(0, 4),
      }))
    );
    const byBrand: Record<string, number> = {};
    for (const r of toInsert) {
      const b = String(r.brand);
      byBrand[b] = (byBrand[b] || 0) + 1;
    }
    console.log('By brand:', byBrand);
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

  console.log(`\nDone. Inserted ${inserted} brooms Phase 1 quote_only stubs.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
