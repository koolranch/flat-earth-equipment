/**
 * Reprice JCB 716/D3632 engine pod fuse box. Keep sku/slug 716D3632.
 *
 * Cost: $925.09 | Magnasource: $1264.96 | Sell: $1199 (~5% under Mag)
 * Old live sticker $180.25 was below cost — archive that Stripe price.
 * TVH prepaid over $650 net → free_freight
 *
 * Run: npx tsx scripts/update-jcb-716-d3632-fuse-box.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { calculateSellPrice } from '../lib/pricing/calculateSellPrice';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SKU = '716D3632';
const COST = 925.09;
const COMP_PRICE = 1264.96;
const COMP_URL = 'https://www.magnasourceinc.com/itemdetail/JC716/D3632';
const priced = calculateSellPrice({
  cost: COST,
  compPrice: COMP_PRICE,
  category: 'assembly',
});
const SELL_PRICE = priced.sellPrice;

const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/jcb-716-d3632-engine-pod-fuse-box.jpg'
);
const STORAGE_PATH = 'jcb-716-d3632-engine-pod-fuse-box.jpg';

const NAME = 'JCB 716/D3632 Engine Pod Fuse Box';
const DESCRIPTION = [
  'Aftermarket engine pod fuse box for JCB equipment. Replaces OEM part number 716/D3632.',
  'Sealed black rectangular module with a circular multi-pin connector on the top face and a single-hole mounting flange on one end. This is the sealed engine-pod box — not an open blade-fuse panel. Ships about 1.5 lb.',
  'Eligible JCB aftermarket parts carry a 2-year warranty. In stock. Free freight to the contiguous US.',
].join('\n\n');

async function main() {
  console.log(`Updating ${SKU}`);
  console.log(
    `   Cost $${COST} | Mag $${COMP_PRICE} → Sell $${SELL_PRICE} (${priced.method}, ${(priced.marginPct * 100).toFixed(1)}%)\n`
  );

  const { data: existing, error: fetchErr } = await supabase
    .from('parts')
    .select('id, sku, slug, stripe_product_id, stripe_price_id, metadata')
    .eq('sku', SKU)
    .maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!existing) throw new Error(`SKU ${SKU} not found`);

  const buf = readFileSync(LOCAL_IMAGE);
  const { error: upErr } = await supabase.storage
    .from('products')
    .upload(STORAGE_PATH, buf, { contentType: 'image/jpeg', upsert: true });
  if (upErr) throw new Error(upErr.message);
  const { data: urlData } = supabase.storage.from('products').getPublicUrl(STORAGE_PATH);
  const imageUrl = urlData.publicUrl;
  console.log(`Hero: ${imageUrl}`);

  let stripeProductId = existing.stripe_product_id as string | null;
  if (!stripeProductId) {
    const product = await stripe.products.create({
      name: NAME,
      description: 'Aftermarket JCB 716/D3632 sealed engine pod fuse box. Circular multi-pin connector.'.slice(
        0,
        500
      ),
      images: [imageUrl],
      metadata: {
        sku: SKU,
        oem_reference: '716/D3632',
        brand: 'JCB',
      },
    });
    stripeProductId = product.id;
    console.log(`Stripe Product: ${stripeProductId}`);
  } else {
    await stripe.products.update(stripeProductId, {
      name: NAME,
      images: [imageUrl],
      description: 'Aftermarket JCB 716/D3632 sealed engine pod fuse box. Circular multi-pin connector.'.slice(
        0,
        500
      ),
    });
  }

  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(SELL_PRICE * 100),
    currency: 'usd',
    metadata: {
      sku: SKU,
      previous_price_id: String(existing.stripe_price_id ?? ''),
      reason: 'reprice_under_mag_from_below_cost',
    },
  });
  console.log(`Stripe Price: ${stripePrice.id}`);

  if (existing.stripe_price_id && existing.stripe_price_id !== stripePrice.id) {
    await stripe.prices.update(existing.stripe_price_id, { active: false });
    console.log(`Archived ${existing.stripe_price_id}`);
  }

  const prevMeta =
    existing.metadata && typeof existing.metadata === 'object'
      ? (existing.metadata as Record<string, unknown>)
      : {};

  const { error: updErr } = await supabase
    .from('parts')
    .update({
      name: NAME,
      description: DESCRIPTION,
      price: SELL_PRICE,
      price_cents: Math.round(SELL_PRICE * 100),
      sales_type: 'direct',
      is_in_stock: true,
      image_url: imageUrl,
      weight_lbs: 1.66,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePrice.id,
      metadata: {
        ...prevMeta,
        oem_pn: '716/D3632',
        aftermarket: true,
        vendor_supply_chain: 'tvh',
        product_type: 'engine_pod_fuse_box',
        cost_wholesale: COST,
        free_freight: true,
        weight_lbs: 1.66,
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
          method: priced.method,
          notes: priced.notes,
          margin_pct: Math.round(priced.marginPct * 1000) / 10,
        },
        source: 'mag_comp_2026-09-17',
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);

  if (updErr) throw new Error(updErr.message);

  console.log(`\nLive: https://www.flatearthequipment.com/parts/${existing.slug}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
