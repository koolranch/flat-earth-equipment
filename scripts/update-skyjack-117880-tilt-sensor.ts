/**
 * Reprice Skyjack 117880 tilt level sensor.
 * Keep sku/slug skyjack-117880-level-sensor.
 *
 * Cost: $192.72 | Magnasource: $330.07 (Intella $358.77) | Sell: $309
 * Old live sticker $35 was a junk eBay comp — archive that Stripe price.
 * TVH Ground: $31 (cost in $150–$299.99 band)
 *
 * Run: npx tsx scripts/update-skyjack-117880-tilt-sensor.ts
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

const SKU = 'skyjack-117880-level-sensor';
const COST = 192.72;
const COMP_PRICE = 330.07;
const COMP_URL = 'https://www.magnasourceinc.com/itemdetail/SJ117880';
const priced = calculateSellPrice({
  cost: COST,
  compPrice: COMP_PRICE,
  category: 'assembly',
});
const SELL_PRICE = priced.sellPrice;

const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/skyjack-117880-tilt-level-sensor.jpg'
);
const STORAGE_PATH = 'skyjack-117880-tilt-level-sensor.jpg';

const NAME = 'Skyjack 117880 Tilt Level Sensor';
const DESCRIPTION = [
  'Aftermarket dual-axis tilt level sensor for Skyjack equipment. Replaces OEM part number 117880.',
  'Red-capped sensor on a spring-mounted plate with a gray two-pin connector. This is the 117880 tilt sensor — not the blue-cap 310585 delay sensor. Fits SJRT 6826/6832 (serials 370000–37002163), 7127/7135 (36486–36000193), 8841 (40471–40000441), 9241 (5604–50000512), and 9250. Ships about 1.4 lb.',
  'In stock.',
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
      description: 'Aftermarket Skyjack 117880 dual-axis tilt level sensor. Red cap, two-pin connector.'.slice(
        0,
        500
      ),
      images: [imageUrl],
      metadata: {
        sku: SKU,
        oem_reference: '117880',
        brand: 'Skyjack',
      },
    });
    stripeProductId = product.id;
    console.log(`Stripe Product: ${stripeProductId}`);
  } else {
    await stripe.products.update(stripeProductId, {
      name: NAME,
      images: [imageUrl],
      description: 'Aftermarket Skyjack 117880 dual-axis tilt level sensor. Red cap, two-pin connector.'.slice(
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
      reason: 'reprice_under_mag_from_ebay_junk',
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
      weight_lbs: 1.37,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePrice.id,
      metadata: {
        ...prevMeta,
        oem_pn: '117880',
        aftermarket: true,
        vendor_supply_chain: 'tvh',
        product_type: 'tilt_level_sensor',
        cost_wholesale: COST,
        freight_cents: 3100,
        free_freight: false,
        weight_lbs: 1.37,
        dual_axis: true,
        provisional_pricing: false,
        competitor_prices: [
          {
            source: 'magnasource',
            price: COMP_PRICE,
            url: COMP_URL,
            fetched_at: new Date().toISOString(),
          },
          {
            source: 'intella',
            price: 358.77,
            url: 'https://intellaparts.com/p/334-117880/sky-jack-117880-aftermarket-tilt-sensor-dual-axis.html',
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
