/**
 * Insert CPA cab-glass quote_only stubs from intake for one or more phases.
 *
 * Usage:
 *   npx tsx scripts/glass/add-cpa-glass-batch.ts --phase 1
 *   npx tsx scripts/glass/add-cpa-glass-batch.ts --phase 1,2
 *   npx tsx scripts/glass/add-cpa-glass-batch.ts --phase all
 *   npx tsx scripts/glass/add-cpa-glass-batch.ts --phase 2 --dry-run
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
  oem_pn_display: string;
  slug: string;
  glass_type: string;
  glass_type_label: string;
  material: string;
  color: string;
  thickness_mm: number | null;
  max_width_mm: number | null;
  min_width_mm: number | null;
  height_mm: number | null;
  hole_count: number | null;
  compatible_models: string[];
  is_pack: boolean;
  pack_qty: number | null;
  phase: string;
  publish_status: string;
  is_glass_accessory: boolean;
  confirm_freight: boolean;
  notes: string;
};

function humanMaterial(material: string): string {
  if (material === 'tempered') return 'tempered safety glass';
  if (material === 'polycarbonate') return 'polycarbonate';
  if (material === 'layered') return 'layered safety glass';
  return material;
}

function buildDescription(row: IntakeRow): string {
  if (row.is_glass_accessory) {
    const fit =
      row.compatible_models.length > 0
        ? ` Fits ${row.brand} models including ${row.compatible_models.slice(0, 8).join(', ')}${row.compatible_models.length > 8 ? ', and more' : ''}.`
        : '';
    return [
      `${row.glass_type_label} for equipment cab glass installation and service.${fit}`,
      row.notes ? row.notes : '',
      `Part number ${row.oem_pn_display}.`,
    ]
      .filter(Boolean)
      .join(' ');
  }

  const tint =
    row.color === 'green'
      ? 'green-tint '
      : row.color === 'clear'
        ? 'clear '
        : '';
  const material = humanMaterial(row.material);
  const dims: string[] = [];
  if (row.thickness_mm) dims.push(`${row.thickness_mm} mm thick`);
  if (row.max_width_mm) dims.push(`${row.max_width_mm} mm max width`);
  if (row.height_mm) dims.push(`${row.height_mm} mm height`);
  const dimText = dims.length ? ` Specs: ${dims.join(', ')}.` : '';
  const holes =
    row.hole_count != null && row.hole_count > 0
      ? ` Includes ${row.hole_count} mounting hole${row.hole_count === 1 ? '' : 's'}.`
      : '';
  const models =
    row.compatible_models.length > 0
      ? ` Fits ${row.brand} ${row.compatible_models.join(', ')}.`
      : '';

  return [
    `Aftermarket ${tint}${material} ${row.glass_type_label.toLowerCase()} for ${row.brand} compact equipment.`,
    `Direct replacement for OEM part number ${row.oem_pn_display}.${models}${dimText}${holes}`,
    row.notes.includes('DOT')
      ? 'DOT-certified tempered safety glass for cab applications.'
      : 'Built for cab visibility and weather sealing on skid steers, compact track loaders, and mini excavators.',
    'Confirm machine model and cab configuration before ordering. Ships via standard ground surface freight.',
  ].join(' ');
}

function buildName(row: IntakeRow): string {
  if (row.brand === 'Cab Glass Accessory') {
    return `${row.glass_type_label} (${row.oem_pn_display})`;
  }
  return `${row.brand} ${row.oem_pn_display} ${row.glass_type_label}`;
}

async function main() {
  const phaseArgIdx = process.argv.indexOf('--phase');
  const phaseArg = phaseArgIdx >= 0 ? process.argv[phaseArgIdx + 1] : null;
  const dryRun = process.argv.includes('--dry-run');
  /** After Phase F freight band ships, pass --no-confirm-freight */
  const noConfirmFreight = process.argv.includes('--no-confirm-freight');

  if (!phaseArg) {
    console.error(
      'Usage: npx tsx scripts/glass/add-cpa-glass-batch.ts --phase 1|1,2|all [--dry-run] [--no-confirm-freight]'
    );
    process.exit(1);
  }

  const intakePath = path.resolve(process.cwd(), 'data/glass/cpa-glass-intake.json');
  const intake: IntakeRow[] = JSON.parse(fs.readFileSync(intakePath, 'utf8'));

  const phases =
    phaseArg === 'all'
      ? null
      : new Set(phaseArg.split(',').map((p) => p.trim()));

  const candidates = intake.filter((row) => {
    if (row.publish_status === 'skip_retail') return false;
    if (phases && !phases.has(row.phase)) return false;
    return true;
  });

  console.log(
    `CPA glass batch — ${candidates.length} candidates (phase=${phaseArg})${dryRun ? ' [DRY RUN]' : ''}\n`
  );

  const { data: existingParts, error: existingErr } = await supabase
    .from('parts')
    .select('slug, sku, oem_reference, metadata');

  if (existingErr) {
    console.error('Failed to load existing parts:', existingErr.message);
    process.exit(1);
  }

  const existingSlugs = new Set((existingParts ?? []).map((p) => p.slug));
  const existingSkus = new Set((existingParts ?? []).map((p) => p.sku));
  const existingOem = new Set(
    (existingParts ?? [])
      .map((p) => (p.oem_reference || '').trim().toUpperCase())
      .filter(Boolean)
  );
  const existingVendor = new Set(
    (existingParts ?? [])
      .map((p) => {
        const meta = (p.metadata ?? {}) as Record<string, unknown>;
        return String(meta.vendor_pn || meta.vendor_sku || '')
          .trim()
          .toUpperCase();
      })
      .filter(Boolean)
  );

  const toInsert = [];
  let skipped = 0;

  for (const row of candidates) {
    const sku = row.slug;
    const oemKey = row.oem_pn_display.toUpperCase();
    const vendorKey = row.vendor_pn.toUpperCase();

    if (
      existingSlugs.has(row.slug) ||
      existingSkus.has(sku) ||
      existingOem.has(oemKey) ||
      existingVendor.has(vendorKey)
    ) {
      skipped += 1;
      console.log(`  skip ${row.vendor_pn} (already exists)`);
      continue;
    }

    const confirmFreight =
      !noConfirmFreight && row.confirm_freight && !row.is_glass_accessory;

    toInsert.push({
      name: buildName(row),
      slug: row.slug,
      sku,
      oem_reference: row.oem_pn_display,
      brand: row.brand === 'Cab Glass Accessory' ? 'Universal' : row.brand,
      category: 'Cab Glass',
      category_slug: 'cab-glass',
      description: buildDescription(row),
      price: 0,
      price_cents: 0,
      sales_type: 'quote_only',
      is_in_stock: false,
      image_url: null,
      compatible_models: row.compatible_models,
      metadata: {
        oem_pn: row.oem_pn_display,
        vendor_pn: row.vendor_pn,
        source: 'cpa_glass_qrg_2110094T',
        glass_type: row.glass_type,
        material: row.material,
        color: row.color,
        thickness_mm: row.thickness_mm,
        max_width_mm: row.max_width_mm,
        min_width_mm: row.min_width_mm,
        height_mm: row.height_mm,
        hole_count: row.hole_count,
        phase: row.phase,
        is_glass_accessory: row.is_glass_accessory,
        confirm_freight: confirmFreight,
        notes: row.notes || null,
      },
    });
  }

  console.log(`\nPrepared ${toInsert.length} inserts (skipped ${skipped}).`);

  if (dryRun || toInsert.length === 0) {
    if (dryRun) {
      console.log(
        'Dry run sample:',
        toInsert.slice(0, 3).map((r) => ({ slug: r.slug, vendor: r.metadata.vendor_pn }))
      );
    }
    return;
  }

  const BATCH = 50;
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

  console.log(`\nDone. Inserted ${inserted} Cab Glass quote_only stubs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
