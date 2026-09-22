/**
 * Convert JCB 557/60210 quote stub → Buy Now. Keep sku/slug 55760210.
 *
 * Cost $2478.72 (operator). TVH qty 4. Mag sticker $2106.85 is under cost —
 * treat as a junk floor, not the street. Operator street $3402.
 * Sell $3399 (sit on the high-ticket street, not a 5% cut).
 * Mag weight 130.07 lb — LTL $250 once per order, not free ground.
 *
 * Run: npx tsx scripts/convert-jcb-557-60210-bucket-ram.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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

const SKU = '55760210';
const OEM = '557/60210';
const COST = 2478.72;
const STREET_COMP = 3402;
const MAG_STICKER = 2106.85;
const MAG_URL = 'https://www.magnasourceinc.com/itemdetail/JC557/60210';
const WEIGHT_LB = 130.07;
const QTY_ON_HAND = 4;
const SELL_PRICE = 3399;
const MARGIN_PCT = (SELL_PRICE - COST) / SELL_PRICE;

const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/jcb-557-60210-bucket-ram-90x60.jpg'
);
const STORAGE_PATH = 'jcb-557-60210-bucket-ram-90x60.jpg';

const NAME = 'JCB 557/60210 Bucket Ram 90×60';
const DESCRIPTION = [
  'Aftermarket bucket ram for JCB equipment. Replaces OEM part number 557/60210.',
  'GA bucket ram, 90 mm bore × 60 mm rod. Pin-eye both ends with bushings. About 130 lb — ships LTL.',
  'Eligible JCB aftermarket parts carry a 2-year warranty. In stock.',
].join('\n\n');

async function main() {
  console.log(`Converting ${SKU}`);
  console.log(
    `   Cost $${COST} · street $${STREET_COMP} · Mag list $${MAG_STICKER} (under cost, ignored) → Sell $${SELL_PRICE} (${(MARGIN_PCT * 100).toFixed(1)}% margin) · LTL $250\n`
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
  const fetchedAt = new Date().toISOString();
  const prevComps = Array.isArray(prevMeta.competitor_prices)
    ? (prevMeta.competitor_prices as Array<Record<string, unknown>>).filter(
        (p) => p.source !== 'operator_street' && p.source !== 'magnasource'
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
        product_type: 'bucket_ram',
        cost_wholesale: COST,
        freight_cents: 25000,
        weight_lbs: WEIGHT_LB,
        secondary_category: 'Bucket Ram 90×60',
        competitor_prices: [
          ...prevComps,
          {
            ...(magPrev ?? {}),
            source: 'magnasource',
            price: MAG_STICKER,
            url: MAG_URL,
            title: 'GA RAM BUCKET 90X60',
            fetched_at: (magPrev?.fetched_at as string | undefined) ?? fetchedAt,
            qty_on_hand: QTY_ON_HAND,
            availability: 'limited',
            weight_lb: WEIGHT_LB,
          },
          {
            source: 'operator_street',
            price: STREET_COMP,
            fetched_at: fetchedAt,
            title: 'JCB 557/60210 Bucket Ram',
            notes: 'lowest online comp; Mag $2106.85 is under cost, ignored for sell',
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
          method: 'high_ticket_street',
          notes: [
            'Priced $3399 vs operator street $3402 (make-money, not 5% cut)',
            `Mag $${MAG_STICKER} is under cost $${COST} — held, not used for sell`,
            '130 lb LTL — $250 freight once per order',
          ],
          margin_pct: Math.round(MARGIN_PCT * 1000) / 10,
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
      qty_on_hand: QTY_ON_HAND,
      note: 'operator photo, watermark cleaned; priced vs $3402 street; Mag under cost held',
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
