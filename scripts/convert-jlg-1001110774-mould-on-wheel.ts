/**
 * Convert JLG 1001110774 quote stub → Buy Now. Keep sku 1001110774 /
 * slug jlg-1001110774-drive-wheel.
 *
 * Cost $387.26 (operator). Mag $760.22 is the street (BHE $542.85 card is
 * unshippable). Sell $719 (~5% under Mag). 105 lb — LTL $192 (Mag same-vendor).
 *
 * Run: npx tsx scripts/convert-jlg-1001110774-mould-on-wheel.ts
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

const SKU = '1001110774';
const OEM = '1001110774';
const COST = 387.26;
const STREET_COMP = 760.22;
const MAG_STICKER = 760.22;
const MAG_URL = 'https://www.magnasourceinc.com/itemdetail/JL1001110774';
const WEIGHT_LB = 105;
const priced = calculateSellPrice({
  cost: COST,
  compPrice: STREET_COMP,
  category: 'assembly',
});
const SELL_PRICE = priced.sellPrice;

const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/jlg-1001110774-mould-on-wheel.jpg'
);
const STORAGE_PATH = 'jlg-1001110774-mould-on-wheel.jpg';

const NAME = 'JLG 1001110774 Mould-On Wheel (22x6x17.75 Non-Marking)';
const DESCRIPTION = [
  'Aftermarket mould-on drive wheel for JLG equipment. Replaces OEM part number 1001110774.',
  '22 × 6 × 17.75 non-marking mould-on tire on the rim — not a pneumatic. About 105 lb — ships LTL.',
  'In stock.',
].join('\n\n');

async function main() {
  console.log(`Converting ${SKU}`);
  console.log(
    `   Cost $${COST} · Mag street $${STREET_COMP} → Sell $${SELL_PRICE} (${priced.method}, ${(priced.marginPct * 100).toFixed(1)}% margin) · LTL $192\n`
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
        brand: 'JLG',
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
  const fetchedAt = new Date().toISOString();
  const prevComps = Array.isArray(prevMeta.competitor_prices)
    ? (prevMeta.competitor_prices as Array<Record<string, unknown>>).filter(
        (p) => p.source !== 'bhe' && p.source !== 'magnasource'
      )
    : [];
  const magPrev = Array.isArray(prevMeta.competitor_prices)
    ? (prevMeta.competitor_prices as Array<Record<string, unknown>>).find(
        (p) => p.source === 'magnasource'
      )
    : undefined;

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
        product_type: 'mould_on_wheel',
        cost_wholesale: COST,
        freight_cents: 19200,
        weight_lbs: WEIGHT_LB,
        warranty_months: 12,
        competitor_prices: [
          ...prevComps,
          {
            ...(magPrev ?? {}),
            source: 'magnasource',
            price: MAG_STICKER,
            url: MAG_URL,
            fetched_at: (magPrev?.fetched_at as string | undefined) ?? fetchedAt,
            qty_on_hand: 100,
            qty_is_floor: true,
            availability: 'in_stock',
            weight_lb: WEIGHT_LB,
          },
          {
            source: 'bhe',
            price: 542.85,
            fetched_at: fetchedAt,
            title: 'JLG 1001110774 Mould-On Wheel',
            notes: 'page-1 card only — cart shipping not available on this 105 lb wheel',
          },
        ],
        mag_watch: {
          ...prevWatch,
          hero: {
            filename: STORAGE_PATH,
            identity_ok: true,
            placeholder_suspect: false,
            checked_at: fetchedAt,
          },
        },
        last_comp_pricing: {
          at: fetchedAt,
          method: priced.method,
          notes: [
            ...priced.notes,
            'Priced vs Mag $760.22 after BHE $542.85 failed shipping',
            '105 lb LTL — $192 freight to match Mag same-vendor outbound',
          ],
          margin_pct: Math.round(priced.marginPct * 1000) / 10,
        },
      },
      updated_at: fetchedAt,
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
      mag_price: MAG_STICKER,
      proposed_sell: SELL_PRICE,
      qty_on_hand: 100,
      note: 'operator photo, watermark cleaned; priced vs Mag $760.22',
      updated_at: fetchedAt,
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
