/**
 * Reprice Skyjack 310585 level sensor.
 * Keep sku/slug skyjack-310585-level-sensor.
 *
 * Cost: $207.71 | Magnasource: $342.58 | Sell: $329 (~5% under Mag)
 * Old live sticker $30 was a junk eBay comp — archive that Stripe price.
 * TVH Ground: $31 (cost in $150–$299.99 band)
 *
 * Run: npx tsx scripts/update-skyjack-310585-level-sensor.ts
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

const SKU = 'skyjack-310585-level-sensor';
const COST = 207.71;
const COMP_PRICE = 342.58;
const COMP_URL = 'https://www.magnasourceinc.com/itemdetail/SJ310585';
const priced = calculateSellPrice({
  cost: COST,
  compPrice: COMP_PRICE,
  category: 'assembly',
});
const SELL_PRICE = priced.sellPrice;

const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/skyjack-310585-level-sensor.jpg'
);
const STORAGE_PATH = 'skyjack-310585-level-sensor.jpg';

const NAME = 'Skyjack 310585 Level Sensor';
const DESCRIPTION = [
  'Aftermarket level sensor for Skyjack equipment. Replaces OEM part number 310585.',
  'Circular tilt/level sensor on a black mounting plate with red and white lead wires and a blue-capped sensing head. This is the 2°/4° sensor with a 2-second delay — not a no-delay switch. Fits SJRT 6826 and SJRT 6832, serials 340003–34001506. Ships about 1.3 lb.',
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
      description: 'Aftermarket Skyjack 310585 level sensor. 2°/4° with 2-second delay.'.slice(0, 500),
      images: [imageUrl],
      metadata: {
        sku: SKU,
        oem_reference: '310585',
        brand: 'Skyjack',
      },
    });
    stripeProductId = product.id;
    console.log(`Stripe Product: ${stripeProductId}`);
  } else {
    await stripe.products.update(stripeProductId, {
      name: NAME,
      images: [imageUrl],
      description: 'Aftermarket Skyjack 310585 level sensor. 2°/4° with 2-second delay.'.slice(0, 500),
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
      weight_lbs: 1.316,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePrice.id,
      metadata: {
        ...prevMeta,
        oem_pn: '310585',
        aftermarket: true,
        vendor_supply_chain: 'tvh',
        product_type: 'level_sensor',
        cost_wholesale: COST,
        freight_cents: 3100,
        free_freight: false,
        weight_lbs: 1.316,
        tilt_deg: '2/4',
        delay_sec: 2,
        provisional_pricing: false,
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
