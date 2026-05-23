/**
 * Tag TVH-sourced catalog rows with pricing metadata for comp-based workflows.
 *
 * Run: npx tsx scripts/tag-tvh-pricing-metadata.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { primaryCompUrl } from '../lib/pricing/compSources';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TVH_SOURCE_PATTERNS = [
  'industrial_seat_guide',
  'tvh_mitsubishi',
  'tvh',
];

const TVH_CATEGORIES = new Set(['Seats', 'Seat cushions', 'Mitsubishi Parts']);

function isTvhSourced(part: {
  metadata: Record<string, unknown> | null;
  category?: string | null;
}): boolean {
  const meta = part.metadata ?? {};
  const src = String(meta.source ?? '');
  if (TVH_SOURCE_PATTERNS.some((p) => src.toLowerCase().includes(p))) return true;
  if (part.category && TVH_CATEGORIES.has(part.category)) return true;
  return false;
}

async function main() {
  const { data: parts, error } = await supabase
    .from('parts')
    .select('id, sku, brand, oem_reference, metadata, category');

  if (error) throw error;

  let updated = 0;

  for (const part of parts ?? []) {
    const meta = (part.metadata ?? {}) as Record<string, unknown>;
    if (!isTvhSourced({ metadata: meta, category: part.category })) continue;
    if (meta.vendor_supply_chain === 'tvh' && meta.pricing_benchmark === 'magnasource') continue;

    const oem = part.oem_reference ?? part.sku;
    const compUrl = primaryCompUrl(oem, part.brand);

    const { error: upErr } = await supabase
      .from('parts')
      .update({
        metadata: {
          ...meta,
          vendor_supply_chain: 'tvh',
          pricing_benchmark: 'magnasource',
          comp_url: compUrl,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', part.id);

    if (!upErr) updated++;
  }

  console.log(`✅ Tagged ${updated} parts with TVH/Magnasource pricing metadata`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
