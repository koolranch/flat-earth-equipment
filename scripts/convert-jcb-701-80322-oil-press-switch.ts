/**
 * Convert JCB 701/80322 quote stub → Buy Now. Keep sku/slug 70180322.
 *
 * Magnasource: $85.06 in stock (100+ on hand, 0.16 lb, 2026-09-16)
 * Sell: ~5% under Mag
 * Freight: $24 Ground via metadata.freight_cents (JCB under-$150 band)
 *
 * Run: npx tsx scripts/convert-jcb-701-80322-oil-press-switch.ts
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

const SKU = '70180322';
const COMP_PRICE = 85.06;
const COMP_URL = 'https://www.magnasourceinc.com/itemdetail/JC701/80322';
const priced = calculateSellPrice({
  compPrice: COMP_PRICE,
  category: 'assembly',
});
const SELL_PRICE = priced.sellPrice;

const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/jcb-701-80322-trans-oil-press-switch.jpg'
);
const STORAGE_PATH = 'jcb-701-80322-trans-oil-press-switch.jpg';

const NAME = 'JCB 701/80322 Transmission Oil Pressure Switch';
const DESCRIPTION = [
  'Aftermarket transmission oil pressure switch for JCB equipment. Replaces OEM part number 701/80322.',
  'Zinc hex body with a male pipe thread and a black 3-pin connector.',
  'Eligible JCB aftermarket parts carry a 2-year warranty. In stock.',
].join('\n\n');

async function main() {
  console.log(`Converting ${SKU}`);
  console.log(`   Mag $${COMP_PRICE} → Sell $${SELL_PRICE} (${priced.method})\n`);

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
      description:
        'Aftermarket JCB 701/80322 transmission oil pressure switch. Zinc hex body, male thread, 3-pin connector.'.slice(
          0,
          500
        ),
      images: [imageUrl],
      metadata: {
        sku: SKU,
        oem_reference: '701/80322',
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
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePrice.id,
      metadata: {
        ...prevMeta,
        oem_pn: '701/80322',
        aftermarket: true,
        vendor_supply_chain: 'tvh',
        product_type: 'oil_pressure_switch',
        freight_cents: 2400,
        competitor_prices: [
          {
            source: 'magnasource',
            price: COMP_PRICE,
            url: COMP_URL,
            fetched_at: new Date().toISOString(),
            qty_on_hand: 100,
            availability: 'in_stock',
            weight_lb: 0.16,
          },
        ],
        last_comp_pricing: {
          at: new Date().toISOString(),
          method: priced.method,
          notes: priced.notes,
        },
        source: 'mag_comp_2026-09-16',
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
