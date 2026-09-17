/**
 * Reprice Genie 78903 ITT-style 9-wire joystick.
 * Keep sku/slug genie-78903-joystick-controller.
 *
 * Cost: $134.65 | Magnasource: $212.02 | Sell: $201 (~5% under Mag)
 * Old live sticker $64 was a junk eBay comp — archive that Stripe price.
 * TVH Ground: $25 (cost in $25–$149.99 band)
 *
 * Run: npx tsx scripts/update-genie-78903-joystick.ts
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

const SKU = 'genie-78903-joystick-controller';
const COST = 134.65;
const COMP_PRICE = 212.02;
const COMP_URL = 'https://www.magnasourceinc.com/itemdetail/GN78903';
const priced = calculateSellPrice({
  cost: COST,
  compPrice: COMP_PRICE,
  category: 'assembly',
});
const SELL_PRICE = priced.sellPrice;

const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/genie-78903-itt-joystick.jpg'
);
const STORAGE_PATH = 'genie-78903-itt-joystick.jpg';

const NAME = 'Genie 78903 ITT-Style Joystick (9-Wire)';
const DESCRIPTION = [
  'Aftermarket single-axis joystick controller for Genie equipment. Replaces OEM part number 78903 (also 78903GT).',
  'T-style grip on a square metal base with a 9-wire harness. This is the single-axis drive/steer joystick — not a dual-axis boom stick. Fits GS68 RT (serial 42382-up), GS84 RT (40213-up), and GS90 RT (41523-up). Ships about 1.6 lb.',
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
      description: 'Aftermarket Genie 78903 ITT-style 9-wire single-axis joystick.'.slice(0, 500),
      images: [imageUrl],
      metadata: {
        sku: SKU,
        oem_reference: '78903',
        brand: 'Genie',
      },
    });
    stripeProductId = product.id;
    console.log(`Stripe Product: ${stripeProductId}`);
  } else {
    await stripe.products.update(stripeProductId, {
      name: NAME,
      images: [imageUrl],
      description: 'Aftermarket Genie 78903 ITT-style 9-wire single-axis joystick.'.slice(0, 500),
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
      weight_lbs: 1.56,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePrice.id,
      metadata: {
        ...prevMeta,
        oem_pn: '78903',
        aftermarket: true,
        vendor_supply_chain: 'tvh',
        product_type: 'joystick_controller',
        cost_wholesale: COST,
        freight_cents: 2500,
        free_freight: false,
        weight_lbs: 1.56,
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
