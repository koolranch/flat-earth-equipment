/**
 * Strip vendor catalog prefixes (GN, JL, JC, etc.) from customer-facing seat fields.
 *
 * Usage:
 *   npx tsx scripts/fix-vendor-oem-prefix-display.ts --dry-run
 *   npx tsx scripts/fix-vendor-oem-prefix-display.ts
 */

import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import {
  getCustomerPartNumber,
  getCustomerProductName,
  hasVendorCatalogPrefix,
  sanitizeCustomerFacingDescription,
  stripVendorCatalogPrefix,
} from '../lib/parts/vendorOemPrefix';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type PartRow = {
  id: string;
  brand: string;
  name: string;
  sku: string;
  oem_reference: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
};

function cleanMetadata(
  metadata: Record<string, unknown> | null,
  brand: string,
): Record<string, unknown> | null {
  if (!metadata) return metadata;

  const next: Record<string, unknown> = { ...metadata };

  if (typeof next.oem_pn === 'string') {
    next.oem_pn = stripVendorCatalogPrefix(next.oem_pn, brand);
  }

  if (typeof next.vendor_catalog_pn !== 'string' && typeof next.oem_pn === 'string') {
    const original = metadata.oem_pn;
    if (typeof original === 'string' && hasVendorCatalogPrefix(original, brand)) {
      next.vendor_catalog_pn = original;
    }
  }

  for (const key of [
    'replacement_back_cushion',
    'replacement_bottom_cushion',
  ] as const) {
    if (typeof next[key] === 'string') {
      next[key] = stripVendorCatalogPrefix(next[key], brand);
    }
  }

  if (Array.isArray(next.related_oem_parts)) {
    next.related_oem_parts = next.related_oem_parts.map((value) =>
      typeof value === 'string' ? stripVendorCatalogPrefix(value, brand) : value,
    );
  }

  return next;
}

function needsUpdate(part: PartRow): boolean {
  const cleanOem = getCustomerPartNumber({
    brand: part.brand,
    sku: part.sku,
    oemReference: part.oem_reference,
  });
  const cleanName = getCustomerProductName(part.name, part.brand);
  const cleanDescription = part.description
    ? sanitizeCustomerFacingDescription(part.description, part.brand)
    : part.description;

  if ((part.oem_reference ?? '') !== cleanOem) return true;
  if (part.name !== cleanName) return true;
  if ((part.description ?? '') !== (cleanDescription ?? '')) return true;

  const metaOem = part.metadata?.oem_pn;
  if (typeof metaOem === 'string' && metaOem !== stripVendorCatalogPrefix(metaOem, part.brand)) {
    return true;
  }

  return false;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  const { data, error } = await supabase
    .from('parts')
    .select('id, brand, name, sku, oem_reference, description, metadata')
    .eq('metadata->>source', 'industrial_seat_guide_v1');

  if (error) {
    console.error('Failed to fetch parts:', error.message);
    process.exit(1);
  }

  const parts = (data ?? []) as PartRow[];
  const updates = parts.filter(needsUpdate).map((part) => {
    const cleanOem = getCustomerPartNumber({
      brand: part.brand,
      sku: part.sku,
      oemReference: part.oem_reference,
    });

    return {
      id: part.id,
      name: getCustomerProductName(part.name, part.brand),
      oem_reference: cleanOem || part.oem_reference,
      description: part.description
        ? sanitizeCustomerFacingDescription(part.description, part.brand)
        : part.description,
      metadata: cleanMetadata(part.metadata, part.brand),
    };
  });

  console.log(`Found ${updates.length} seat listings to clean (${parts.length} total seat-guide rows).`);

  if (dryRun) {
    for (const row of updates.slice(0, 10)) {
      const original = parts.find((part) => part.id === row.id)!;
      console.log(`\n${original.brand}`);
      console.log(`  name: ${original.name}`);
      console.log(`    -> ${row.name}`);
      console.log(`  oem:  ${original.oem_reference}`);
      console.log(`    -> ${row.oem_reference}`);
    }
    return;
  }

  let updated = 0;
  for (const row of updates) {
    const { error: updateError } = await supabase
      .from('parts')
      .update({
        name: row.name,
        oem_reference: row.oem_reference,
        description: row.description,
        metadata: row.metadata,
      })
      .eq('id', row.id);

    if (updateError) {
      console.error(`Failed ${row.id}:`, updateError.message);
      continue;
    }

    updated += 1;
  }

  console.log(`Updated ${updated} listings.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
