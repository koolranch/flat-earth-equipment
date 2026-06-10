/**
 * Create Stripe products/prices for parts_catalog chargers and enable
 * direct checkout on /chargers/[slug] PDPs.
 *
 * Sell price = round(fsip_price * (1 + markup)) in whole dollars.
 * fsip_price is FSIP's public retail price, so the dry-run table shows
 * the supplier comparison explicitly before anything is created.
 *
 * Usage:
 *   npx tsx scripts/create-charger-stripe-prices.ts             # dry run (default)
 *   npx tsx scripts/create-charger-stripe-prices.ts --apply     # create in Stripe + update DB
 *   npx tsx scripts/create-charger-stripe-prices.ts --markup 20 # markup percent (default 20)
 *
 * Idempotent: rows whose existing Stripe price already matches the target
 * amount are skipped. Rows priced at a different markup get a new price on
 * the same Stripe product; the old price is deactivated (prices are
 * immutable in Stripe).
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const APPLY = process.argv.includes('--apply');
const markupIdx = process.argv.indexOf('--markup');
const MARKUP_PCT = markupIdx > -1 ? Number(process.argv[markupIdx + 1]) : 20;

type ChargerRow = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  fsip_price: number | null;
  your_price: number | null;
  in_stock: boolean | null;
  images: string[] | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
};

async function main() {
  if (!Number.isFinite(MARKUP_PCT) || MARKUP_PCT <= 0 || MARKUP_PCT > 100) {
    throw new Error(`Invalid markup: ${MARKUP_PCT}`);
  }

  const { data, error } = await supabase
    .from('parts_catalog')
    .select('id, sku, name, slug, fsip_price, your_price, in_stock, images, stripe_product_id, stripe_price_id')
    .eq('category_type', 'charger')
    .order('name');

  if (error) throw error;

  const rows = (data as ChargerRow[]).filter((r) => r.fsip_price !== null && r.fsip_price > 0);
  const skipped = (data as ChargerRow[]).filter((r) => !r.fsip_price || r.fsip_price <= 0);

  console.log(`\nMode: ${APPLY ? 'APPLY (creates Stripe objects + updates DB)' : 'DRY RUN'}`);
  console.log(`Markup: ${MARKUP_PCT}% over FSIP retail\n`);
  console.log(
    'SKU'.padEnd(22) +
      'Name'.padEnd(46) +
      'FSIP retail'.padStart(12) +
      'Our price'.padStart(11) +
      '  Status'
  );
  console.log('-'.repeat(105));

  for (const row of rows) {
    const sell = Math.round(row.fsip_price! * (1 + MARKUP_PCT / 100));
    const targetCents = sell * 100;

    let existingCents: number | null = null;
    if (row.stripe_price_id) {
      const existing = await stripe.prices.retrieve(row.stripe_price_id);
      existingCents = existing.unit_amount;
    }

    const status =
      existingCents === targetCents
        ? 'SKIP (already at target price)'
        : row.stripe_price_id
          ? `REPRICE (currently $${((existingCents ?? 0) / 100).toFixed(2)})`
          : 'CREATE';

    console.log(
      row.sku.padEnd(22) +
        row.name.slice(0, 44).padEnd(46) +
        `$${row.fsip_price!.toFixed(2)}`.padStart(12) +
        `$${sell.toFixed(2)}`.padStart(11) +
        `  ${status}`
    );

    if (!APPLY || existingCents === targetCents) continue;

    let productId = row.stripe_product_id;
    if (!productId) {
      const product = await stripe.products.create({
        name: row.name,
        metadata: {
          sku: row.sku,
          slug: row.slug,
          source: 'parts_catalog',
          fsip_retail: String(row.fsip_price),
          markup_pct: String(MARKUP_PCT),
        },
        ...(row.images && row.images.length > 0 ? { images: [row.images[0]] } : {}),
      });
      productId = product.id;
    }

    const price = await stripe.prices.create({
      product: productId,
      unit_amount: targetCents,
      currency: 'usd',
      metadata: { markup_pct: String(MARKUP_PCT), fsip_retail: String(row.fsip_price) },
    });

    const { error: updateError } = await supabase
      .from('parts_catalog')
      .update({
        your_price: sell,
        stripe_product_id: productId,
        stripe_price_id: price.id,
      })
      .eq('id', row.id);

    if (updateError) {
      console.error(`  DB update failed for ${row.sku}: ${updateError.message}`);
      console.error(`  New Stripe price left active but unreferenced: ${price.id}`);
      continue;
    }

    // Deactivate the superseded price only after the DB points at the new one.
    if (row.stripe_price_id) {
      await stripe.prices.update(row.stripe_price_id, { active: false });
    }
    console.log(`  -> ${productId} / ${price.id}`);
  }

  if (skipped.length > 0) {
    console.log(`\nSkipped ${skipped.length} charger(s) with no FSIP price (stay quote-only):`);
    for (const r of skipped) console.log(`  - ${r.sku}  ${r.name}`);
  }

  console.log(
    APPLY
      ? '\nDone. PDPs with a stripe_price_id now offer direct checkout; the Google Shopping feed picks up your_price automatically.'
      : '\nDry run complete. Re-run with --apply to create Stripe prices.'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
