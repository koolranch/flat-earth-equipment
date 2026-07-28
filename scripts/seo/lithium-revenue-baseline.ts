/**
 * Print Lithium Batteries Stripe price IDs for revenue baseline queries.
 *
 * Usage:
 *   npx tsx scripts/seo/lithium-revenue-baseline.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * (loads .env.production.local then .env.local).
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from('parts')
    .select('slug, sku, name, price, stripe_price_id, metadata')
    .eq('category', 'Lithium Batteries')
    .order('price', { ascending: true });

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log('Lithium Batteries Stripe price IDs (revenue attribution)\n');
  console.log(
    `${'SKU'.padEnd(22)} ${'Price'.padStart(8)} ${'Type'.padEnd(8)} ${'Stripe price ID'.padEnd(34)} Slug`
  );
  console.log('-'.repeat(120));

  const priceIds: string[] = [];
  for (const row of data ?? []) {
    const meta = (row.metadata as Record<string, unknown> | null) ?? {};
    const type = meta.product_type === 'battery' ? 'battery' : 'kit';
    const priceId = row.stripe_price_id || '(missing)';
    if (row.stripe_price_id) priceIds.push(row.stripe_price_id);
    console.log(
      `${String(row.sku || '').padEnd(22)} $${Number(row.price).toFixed(0).padStart(7)} ${type.padEnd(8)} ${priceId.padEnd(34)} ${row.slug}`
    );
  }

  console.log(`\n${priceIds.length} price IDs with Stripe linkage.`);
  console.log('\nStripe Dashboard → Payments: filter by these price IDs (last 90 days).');
  console.log('GA4 Explorations: view_item / add_to_cart / begin_checkout');
  console.log('  (item_category = Lithium Batteries, or item_name contains Lithium Rhino)');
  console.log('\nCanonical hub: https://www.flatearthequipment.com/lithium-batteries');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
