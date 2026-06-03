/**
 * Add Caterpillar / MCFA 9305122040 Lift Cylinder Assembly — Supabase + Stripe.
 *
 * Cost: $879.83 | Comp (Magnasource): $1,074.17 | Sell: $1,019 (5% below comp)
 *
 * Run: npx tsx scripts/add-caterpillar-9305122040-lift-cylinder.ts
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

const STORAGE_PUBLIC = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

const COST = 879.83;
const COMP_PRICE = 1074.17;
const COMP_URL = 'https://www.magnasourceinc.com/itemdetail/CT9305122040';

/** $20 below Magnasource comp (preferred over default 5% rule for this SKU). */
const SELL_PRICE = Math.round(COMP_PRICE - 20);

const PRODUCT = {
  sku: '9305122040',
  slug: 'caterpillar-9305122040-lift-cylinder-assembly',
  oemReference: '93051-22040',
  name: 'Caterpillar 93051-22040 Lift Cylinder Assembly',
  brand: 'Caterpillar',
  category: 'Mitsubishi Parts',
  categorySlug: 'mitsubishi-parts',
  sellPrice: SELL_PRICE,
  imageUrl: `${STORAGE_PUBLIC}/brand-logos/caterpillar.webp`,

  description: [
    'Aftermarket lift cylinder assembly equivalent to Caterpillar / Mitsubishi OEM part number 93051-22040 (also listed as 9305122040). Restores rated lifting capacity on MCFA-family forklifts that share this main lift cylinder platform under the Mitsubishi-Caterpillar partnership.',

    'Cross-references include CT9305122040, MB9305122040, DW9305122040, and 9305122040. Confirm your machine model and serial number before ordering — cylinder port orientation and rod length can vary by production series.',

    'Typical symptoms of a failed lift cylinder: slow lift, drift under load, external weeping at the rod gland, or scored rod/bore requiring assembly replacement rather than a seal kit alone. Pair with the matching lift cylinder seal kit when only seals are worn and the bore is in serviceable condition.',

    'Ships as a heavy hydraulic component — $150 flat-rate ground freight is added at checkout (lower than typical distributor freight on this assembly). In stock for direct purchase; contact parts@flatearthequipment.com for fitment verification on your serial number.',
  ].join('\n\n'),

  metadata: {
    oem_pn: '93051-22040',
    cost_wholesale: COST,
    vendor_supply_chain: 'tvh',
    cross_references: [
      '9305122040',
      '93051-22040',
      'CT9305122040',
      'MB9305122040',
      'DW9305122040',
    ],
    competitor_prices: [
      {
        source: 'magnasource',
        price: COMP_PRICE,
        url: COMP_URL,
        fetched_at: new Date().toISOString(),
      },
    ],
    last_comp_pricing: {
      at: new Date().toISOString(),
      method: 'comp_minus_20',
      margin_pct: Math.round(((SELL_PRICE - COST) / SELL_PRICE) * 1000) / 10,
    },
    source: 'tvh_mitsubishi_v1',
    /** Overrides Mitsubishi $50 tier — heavy lift cylinder (Magnasource freight ~$163). */
    freight_cents: 15000,
  },
};

async function main() {
  console.log(`🚀 Adding ${PRODUCT.name}`);
  console.log(`   Cost $${COST} | Comp $${COMP_PRICE} → Sell $${PRODUCT.sellPrice} ($20 under comp)\n`);

  const { data: existing } = await supabase
    .from('parts')
    .select('id, stripe_product_id')
    .eq('sku', PRODUCT.sku)
    .maybeSingle();

  let stripeProductId = existing?.stripe_product_id;
  if (!stripeProductId) {
    const product = await stripe.products.create({
      name: PRODUCT.name,
      description:
        'Caterpillar/Mitsubishi lift cylinder assembly OEM 93051-22040 (9305122040). MCFA forklift main lift cylinder replacement.'.slice(
          0,
          500
        ),
      metadata: {
        sku: PRODUCT.sku,
        oem_reference: PRODUCT.oemReference,
        brand: PRODUCT.brand,
      },
    });
    stripeProductId = product.id;
    console.log(`✅ Stripe Product: ${stripeProductId}`);
  }

  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(PRODUCT.sellPrice * 100),
    currency: 'usd',
    metadata: { sku: PRODUCT.sku },
  });
  console.log(`✅ Stripe Price: ${stripePrice.id}`);

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: PRODUCT.name,
    slug: PRODUCT.slug,
    sku: PRODUCT.sku,
    oem_reference: PRODUCT.oemReference,
    brand: PRODUCT.brand,
    category: PRODUCT.category,
    category_slug: PRODUCT.categorySlug,
    description: PRODUCT.description,
    price: PRODUCT.sellPrice,
    price_cents: Math.round(PRODUCT.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: true,
    image_url: PRODUCT.imageUrl,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: PRODUCT.metadata,
    updated_at: new Date().toISOString(),
  };

  const { data: upserted, error } = await supabase
    .from('parts')
    .upsert(row, { onConflict: 'sku' })
    .select('id, slug')
    .single();

  if (error) throw new Error(error.message);

  const margin = ((PRODUCT.sellPrice - COST) / PRODUCT.sellPrice) * 100;
  console.log(`\n✅ Supabase: ${upserted.id}`);
  console.log(`   Margin: ${margin.toFixed(1)}% ($${(PRODUCT.sellPrice - COST).toFixed(2)} gross)`);
  console.log(`   Live: https://www.flatearthequipment.com/parts/${upserted.slug}`);
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
