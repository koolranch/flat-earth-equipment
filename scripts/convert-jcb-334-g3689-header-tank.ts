/**
 * Convert JCB 334/G3689 quote stub → Buy Now. Keep sku/slug 334G3689.
 *
 * Cost $77.28 (operator). Equipment Share $121.85 is the street (Mag $150.14 high).
 * Sell $116 (~5% under Equipment Share). Freight $25 (TVH $25–$149.99 band).
 *
 * Run: npx tsx scripts/convert-jcb-334-g3689-header-tank.ts
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

const SKU = '334G3689';
const OEM = '334/G3689';
const COST = 77.28;
const COMP_PRICE = 121.85;
const COMP_URL = 'https://www.magnasourceinc.com/itemdetail/JC334/G3689';
const WEIGHT_LB = 3.86;
const priced = calculateSellPrice({
  cost: COST,
  compPrice: COMP_PRICE,
  category: 'assembly',
});
const SELL_PRICE = priced.sellPrice;

const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/jcb-334-g3689-header-tank.jpg'
);
const STORAGE_PATH = 'jcb-334-g3689-header-tank.jpg';

const NAME = 'JCB 334/G3689 Header Tank';
const DESCRIPTION = [
  'Aftermarket coolant header tank for JCB equipment. Replaces OEM part number 334/G3689.',
  'Translucent expansion tank with a 1.5 bar cap, two hose nipples, and mounting tabs. About 4 lb.',
  'Eligible JCB aftermarket parts carry a 2-year warranty. In stock.',
].join('\n\n');

async function main() {
  console.log(`Converting ${SKU}`);
  console.log(
    `   Cost $${COST} · Mag $${COMP_PRICE} → Sell $${SELL_PRICE} (${priced.method}, ${(priced.marginPct * 100).toFixed(1)}% margin) · freight $25\n`
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
        product_type: 'header_tank',
        cost_wholesale: COST,
        freight_cents: 2500,
        weight_lbs: WEIGHT_LB,
        secondary_category: 'Header Tank',
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
          notes: priced.notes,
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
      mag_price: 150.14,
      proposed_sell: SELL_PRICE,
      qty_on_hand: 100,
      note: 'operator photo, watermark cleaned',
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
