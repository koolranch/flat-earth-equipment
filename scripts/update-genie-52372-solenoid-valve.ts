/**
 * Reprice Genie 52372 proportional solenoid valve.
 * Keep sku/slug genie-52372-solenoid-proportional.
 *
 * Cost: $246.98 | Magnasource: $572.89 | Sell: $539 (~5% under Mag)
 * Old live sticker $16 was a junk Amazon comp — archive that Stripe price.
 * TVH Ground: $31 (cost in $150–$299.99 band)
 *
 * Run: npx tsx scripts/update-genie-52372-solenoid-valve.ts
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

const SKU = 'genie-52372-solenoid-proportional';
const COST = 246.98;
const COMP_PRICE = 572.89;
const COMP_URL = 'https://www.magnasourceinc.com/itemdetail/GN52372';
const priced = calculateSellPrice({
  cost: COST,
  compPrice: COMP_PRICE,
  category: 'assembly',
});
const SELL_PRICE = priced.sellPrice;

const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/genie-52372-proportional-solenoid-valve.jpg'
);
const STORAGE_PATH = 'genie-52372-proportional-solenoid-valve.jpg';

const NAME = 'Genie 52372 Proportional Solenoid Valve';
const DESCRIPTION = [
  'Aftermarket proportional solenoid valve for Genie equipment. Replaces OEM part number 52372 (also 52372GT).',
  'Cartridge-style valve: hex nut on the coil end, hex body, threaded cartridge with two O-rings and a dark nose. This is the proportional solenoid valve — not a relief or on/off cartridge. Fits GS68 RT. Ships about 0.8 lb.',
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
      description: 'Aftermarket Genie 52372 proportional solenoid cartridge valve.'.slice(0, 500),
      images: [imageUrl],
      metadata: {
        sku: SKU,
        oem_reference: '52372',
        brand: 'Genie',
      },
    });
    stripeProductId = product.id;
    console.log(`Stripe Product: ${stripeProductId}`);
  } else {
    await stripe.products.update(stripeProductId, {
      name: NAME,
      images: [imageUrl],
      description: 'Aftermarket Genie 52372 proportional solenoid cartridge valve.'.slice(0, 500),
    });
  }

  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(SELL_PRICE * 100),
    currency: 'usd',
    metadata: {
      sku: SKU,
      previous_price_id: String(existing.stripe_price_id ?? ''),
      reason: 'reprice_under_mag_from_amazon_junk',
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
      weight_lbs: 0.8,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePrice.id,
      metadata: {
        ...prevMeta,
        oem_pn: '52372',
        aftermarket: true,
        vendor_supply_chain: 'tvh',
        product_type: 'proportional_solenoid_valve',
        cost_wholesale: COST,
        freight_cents: 3100,
        free_freight: false,
        weight_lbs: 0.8,
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
