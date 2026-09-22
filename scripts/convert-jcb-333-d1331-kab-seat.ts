/**
 * Convert JCB 333/D1331 quote stub → Buy Now. Keep sku/slug 333D1331.
 *
 * Cost $1954.86 (operator). Mag sticker $2664.20 / qty 2 limited (2026-09-18).
 * Operator override: list at qty 2. Pull when Mag reads 0 / backorder / special-order.
 * Sell $2529 (~5% under Mag).
 *
 * Run: npx tsx scripts/convert-jcb-333-d1331-kab-seat.ts
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

const SKU = '333D1331';
const OEM = '333/D1331';
const COST = 1954.86;
const COMP_PRICE = 2664.2;
const COMP_URL = 'https://www.magnasourceinc.com/itemdetail/JC333/D1331';
const WEIGHT_LB = 74.96;
const priced = calculateSellPrice({
  cost: COST,
  compPrice: COMP_PRICE,
  category: 'assembly',
});
const SELL_PRICE = priced.sellPrice;

const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/jcb-333-d1331-kab-adjustable-back-seat.jpg'
);
const STORAGE_PATH = 'jcb-333-d1331-kab-adjustable-back-seat.jpg';

const NAME = 'JCB 333/D1331 KAB Adjustable-Back Seat';
const DESCRIPTION = [
  'Aftermarket KAB mechanical-suspension operator seat for JCB equipment. Replaces OEM part number 333/D1331.',
  'Black fabric cushion and backrest on a mechanical suspension base, adjustable back, side recliner, and slide rails. No armrests. About 75 lb.',
  'Eligible JCB aftermarket parts carry a 2-year warranty. In stock.',
].join('\n\n');

async function main() {
  console.log(`Converting ${SKU}`);
  console.log(
    `   Cost $${COST} · Mag $${COMP_PRICE} qty 2 → Sell $${SELL_PRICE} (${priced.method}, ${(priced.marginPct * 100).toFixed(1)}% margin)\n`
  );

  const { data: existing, error: fetchErr } = await supabase
    .from('parts')
    .select('id, sku, slug, stripe_product_id, metadata')
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
      description: DESCRIPTION.slice(0, 500),
      images: [imageUrl],
      metadata: {
        sku: SKU,
        oem_reference: OEM,
        brand: 'JCB',
      },
    });
    stripeProductId = product.id;
    console.log(`Stripe Product: ${stripeProductId}`);
  } else {
    await stripe.products.update(stripeProductId, {
      name: NAME,
      images: [imageUrl],
    });
  }

  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(SELL_PRICE * 100),
    currency: 'usd',
    metadata: { sku: SKU },
  });
  console.log(`Stripe Price: ${stripePrice.id}`);

  const prevMeta =
    existing.metadata && typeof existing.metadata === 'object'
      ? (existing.metadata as Record<string, unknown>)
      : {};
  const prevWatch =
    prevMeta.mag_watch && typeof prevMeta.mag_watch === 'object'
      ? (prevMeta.mag_watch as Record<string, unknown>)
      : {};
  const prevComps = Array.isArray(prevMeta.competitor_prices)
    ? (prevMeta.competitor_prices as Array<Record<string, unknown>>)
    : [];

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
      weight_lbs: WEIGHT_LB,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePrice.id,
      metadata: {
        ...prevMeta,
        oem_pn: OEM,
        aftermarket: true,
        vendor_supply_chain: 'tvh',
        product_type: 'kab_mechanical_seat',
        cost_wholesale: COST,
        free_freight: true,
        weight_lbs: WEIGHT_LB,
        secondary_category: 'KAB Adjustable-Back Seat',
        competitor_prices: prevComps,
        mag_watch: {
          ...prevWatch,
          last_availability: 'limited',
          sold_out_streak: 0,
          hero: {
            filename: STORAGE_PATH,
            identity_ok: true,
            placeholder_suspect: false,
            checked_at: new Date().toISOString(),
          },
        },
        last_comp_pricing: {
          at: new Date().toISOString(),
          method: priced.method,
          notes: [
            ...priced.notes,
            'Operator listed at Mag qty 2 — pull on the next clean Mag sold-out read',
          ],
          margin_pct: Math.round(priced.marginPct * 1000) / 10,
        },
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);

  if (updErr) throw new Error(updErr.message);

  const { error: trayErr } = await supabase.from('part_image_reviews').upsert(
    {
      sku: SKU,
      part_id: existing.id,
      slug: existing.slug,
      status: 'approved',
      filename: STORAGE_PATH,
      identity_ok: true,
      public_url: imageUrl,
      mag_price: COMP_PRICE,
      proposed_sell: SELL_PRICE,
      qty_on_hand: 2,
      note: 'operator photo, watermark cleaned; listed at Mag qty 2',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'sku' }
  );
  if (trayErr) console.warn(`tray upsert: ${trayErr.message}`);

  console.log(`\nLive: https://www.flatearthequipment.com/parts/${existing.slug}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
