/**
 * Apply Buy Now for TVH pilot in-stock rows only (5% under verified comps).
 *
 * Reads data/pricing/tvh-comp-pilot-apply.json, filters inStockHint === 'in_stock',
 * creates Stripe prices, updates Supabase parts.
 *
 * Usage:
 *   npx tsx scripts/pricing/apply-tvh-comp-pilot-instock.ts --dry-run
 *   npx tsx scripts/pricing/apply-tvh-comp-pilot-instock.ts
 */

import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

type ApplyRow = {
  sku: string;
  slug: string;
  brand: string;
  oem: string;
  category: string;
  compPrice: number;
  sellPrice: number;
  compSource: string;
  compUrl: string;
  inStockHint: string | null;
  tvhAligned: boolean;
};

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  if (!stripeKey && !dryRun) throw new Error('Missing STRIPE_SECRET_KEY');

  const supabase = createClient(url, key);
  const stripe = stripeKey ? new Stripe(stripeKey) : null;

  const applyPath = path.resolve(process.cwd(), 'data/pricing/tvh-comp-pilot-apply.json');
  const rows: ApplyRow[] = JSON.parse(fs.readFileSync(applyPath, 'utf8')).filter(
    (r: ApplyRow) => r.inStockHint === 'in_stock'
  );

  console.log(
    `TVH pilot in-stock apply — ${rows.length} SKUs${dryRun ? ' [DRY RUN]' : ''}\n`
  );

  let updated = 0;
  for (const row of rows) {
    const { data: part, error } = await supabase
      .from('parts')
      .select('*')
      .eq('slug', row.slug)
      .maybeSingle();

    if (error || !part) {
      console.error(`  miss ${row.slug}: ${error?.message || 'not found'}`);
      continue;
    }

    const price = Number(row.sellPrice);
    const priceCents = Math.round(price * 100);
    console.log(
      `${row.brand} ${row.oem}  $${part.price} ${part.sales_type} → $${price.toFixed(2)} (${row.compSource} $${row.compPrice})`
    );

    if (dryRun) {
      updated += 1;
      continue;
    }

    let stripeProductId = part.stripe_product_id as string | null;
    if (!stripeProductId) {
      const product = await stripe!.products.create({
        name: part.name,
        description: part.description || undefined,
        metadata: {
          sku: part.sku,
          oem_reference: part.oem_reference || row.oem,
          brand: row.brand,
        },
      });
      stripeProductId = product.id;
    }

    const stripePrice = await stripe!.prices.create({
      product: stripeProductId,
      unit_amount: priceCents,
      currency: 'usd',
      metadata: {
        sku: part.sku,
        comp_price: String(row.compPrice),
        comp_source: row.compSource,
        pilot: 'tvh-comp-pilot',
      },
    });

    const meta = {
      ...(part.metadata || {}),
      comp_price: row.compPrice,
      sell_price: price,
      comp_source: row.compSource,
      comp_url: row.compUrl,
      tvh_aligned: row.tvhAligned,
      in_stock_hint: row.inStockHint,
      priced_at: new Date().toISOString().slice(0, 10),
      pricing_pilot: 'tvh-comp-pilot-instock',
    };

    const { error: updErr } = await supabase
      .from('parts')
      .update({
        price,
        price_cents: priceCents,
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePrice.id,
        sales_type: 'direct',
        is_in_stock: true,
        oem_reference: part.oem_reference || row.oem,
        metadata: meta,
        updated_at: new Date().toISOString(),
      })
      .eq('id', part.id);

    if (updErr) {
      console.error(`  update failed ${row.slug}: ${updErr.message}`);
      continue;
    }

    console.log(`  live https://www.flatearthequipment.com/parts/${row.slug}`);
    updated += 1;
  }

  console.log(`\nDone. ${updated}/${rows.length}${dryRun ? ' (dry run)' : ' updated'}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
