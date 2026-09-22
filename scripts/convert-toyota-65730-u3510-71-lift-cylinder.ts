/**
 * Convert Toyota 65730-U3510-71 quote stub → Buy Now.
 * Keep sku 65730-U3510-71 / slug toyota-65730-u3510-71-lift-cylinder.
 *
 * Cost $5236.30 (operator). Mag $5798.27 / 17 on hand / 70 lb (2026-09-18).
 * 20% floor ($6549) would sit above Mag, so sell $5797 (just under Mag).
 * Thin ~9.7% / $561. 70 lb under LTL — TVH net ≥ $650 → free_freight.
 *
 * Run: npx tsx scripts/convert-toyota-65730-u3510-71-lift-cylinder.ts
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

const SKU = '65730-U3510-71';
const OEM = '65730-U3510-71';
const COST = 5236.3;
const COMP_PRICE = 5798.27;
const COMP_URL = 'https://www.magnasourceinc.com/itemdetail/TY65730-U3510-71';
const WEIGHT_LB = 70;
const priced = calculateSellPrice({
  cost: COST,
  compPrice: COMP_PRICE,
  category: 'assembly',
});
const SELL_PRICE = priced.sellPrice;

const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/toyota-65730-u3510-71-lift-cylinder.jpg'
);
const STORAGE_PATH = 'toyota-65730-u3510-71-lift-cylinder.jpg';

const NAME = 'Toyota 65730-U3510-71 Lift Cylinder Assembly';
const DESCRIPTION = [
  'Aftermarket lift cylinder assembly for Toyota forklifts. Replaces OEM part number 65730-U3510-71.',
  'Complete lift cylinder with a welded side-mount bracket. About 70 lb. This is the lift cylinder, not a tilt ram.',
  'Eligible Toyota aftermarket parts carry a 2-year warranty. In stock.',
].join('\n\n');

async function main() {
  console.log(`Converting ${SKU}`);
  console.log(
    `   Cost $${COST} · Mag $${COMP_PRICE} → Sell $${SELL_PRICE} (${priced.method}, ${(priced.marginPct * 100).toFixed(1)}% margin) · free freight\n`
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
        brand: 'Toyota',
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
  const { warranty_months: _dropWarrantyMonths, ...metaWithoutShortWarranty } = prevMeta;

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
        ...metaWithoutShortWarranty,
        oem_pn: OEM,
        aftermarket: true,
        vendor_supply_chain: 'tvh',
        product_type: 'lift_cylinder',
        cost_wholesale: COST,
        free_freight: true,
        weight_lbs: WEIGHT_LB,
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
            '20% floor would sit above Mag — capped just under Mag $5798.27',
            '70 lb under LTL; TVH net ≥ $650 → free_freight',
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
      mag_price: COMP_PRICE,
      proposed_sell: SELL_PRICE,
      qty_on_hand: 17,
      note: 'operator photo, watermark cleaned; thin Mag street vs cost',
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
