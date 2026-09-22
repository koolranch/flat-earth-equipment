/**
 * Convert JCB 450/10900 quote stub → Buy Now. Keep sku/slug 45010900.
 *
 * Cost $504 (operator). TVH qty 5. Mag sticker $2371.88 is a high list, not the street.
 * Page-1 comps: Texas Machinery Parts $750 (less common, ranks), Broken Tractor $1200.
 * Sell $709 (~5% under Texas $750). Freight $41 (TVH $500–649.99 band; cost under $650).
 *
 * Run: npx tsx scripts/convert-jcb-450-10900-differential.ts
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

const SKU = '45010900';
const OEM = '450/10900';
const COST = 504;
const STREET_COMP = 750;
const MAG_STICKER = 2371.88;
const MAG_URL = 'https://www.magnasourceinc.com/itemdetail/JC450/10900';
const WEIGHT_LB = 47.73;
const QTY_ON_HAND = 5;
const priced = calculateSellPrice({
  cost: COST,
  compPrice: STREET_COMP,
  category: 'assembly',
});
const SELL_PRICE = priced.sellPrice;

const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/jcb-450-10900-differential-assembly.jpg'
);
const STORAGE_PATH = 'jcb-450-10900-differential-assembly.jpg';

const NAME = 'JCB 450/10900 Differential Assembly';
const DESCRIPTION = [
  'Aftermarket differential assembly for JCB equipment. Replaces OEM part number 450/10900.',
  'Complete assembly with gears in the housing — not the empty housing (450/10800). Eight-bolt flange, pinion snout, about 48 lb.',
  'Eligible JCB aftermarket parts carry a 2-year warranty. In stock.',
].join('\n\n');

async function main() {
  console.log(`Converting ${SKU}`);
  console.log(
    `   Cost $${COST} · street $${STREET_COMP} (Texas) · Mag list $${MAG_STICKER} → Sell $${SELL_PRICE} (${priced.method}, ${(priced.marginPct * 100).toFixed(1)}% margin)\n`
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
        (p) =>
          p.source !== 'texas_machinery_parts' &&
          p.source !== 'broken_tractor' &&
          p.source !== 'magnasource'
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
        product_type: 'differential_assembly',
        cost_wholesale: COST,
        freight_cents: 4100,
        weight_lbs: WEIGHT_LB,
        secondary_category: 'Differential Assembly',
        competitor_prices: [
          ...prevComps,
          {
            ...(magPrev ?? {}),
            source: 'magnasource',
            price: MAG_STICKER,
            url: MAG_URL,
            title: 'DIFFERENTIAL ASSEMBLY',
            fetched_at: (magPrev?.fetched_at as string | undefined) ?? fetchedAt,
            qty_on_hand: QTY_ON_HAND,
            availability: 'limited',
            weight_lb: WEIGHT_LB,
          },
          {
            source: 'texas_machinery_parts',
            price: STREET_COMP,
            fetched_at: fetchedAt,
            title: 'JCB 450/10900 Differential Assembly',
            notes: 'page-1 street; less common seller',
          },
          {
            source: 'broken_tractor',
            price: 1200,
            fetched_at: fetchedAt,
            title: 'JCB 450/10900 Differential Assembly',
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
            'Priced vs page-1 Texas Machinery $750, not Mag list $2371.88',
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
      qty_on_hand: QTY_ON_HAND,
      note: 'operator photo, watermark cleaned; priced vs Texas $750 street',
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
