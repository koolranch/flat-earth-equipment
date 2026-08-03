/**
 * Add Navitas Yamaha Drive2 (NEOS) TAC2 440A kit — Supabase + Stripe.
 *
 * SKU: 64-NAVYAMTAC2-G29-4
 * Cost: $675 · Sell: $899 · Free freight
 * Note: kit does NOT include On-The-Fly programmer (Bluetooth app only).
 *
 * Run: npx tsx scripts/add-navitas-tac2-drive2-440a.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, copyFileSync, mkdirSync, existsSync } from 'fs';
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

const STORAGE_BUCKET = 'products';
const IMAGE_STORAGE_PATH = 'navitas-tac2-drive2-440a-conversion-kit.png';
const LOCAL_SOURCE_IMAGE = path.resolve(
  process.env.HOME || '',
  '.cursor/projects/Users-christopherray-Documents-flat-earth-equipment/assets/navitas-tac2-drive2-440a-ecommerce.png'
);
const FALLBACK_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/navitas-tsx-600a-conversion-kit.png'
);
const PUBLIC_IMAGE_DIR = path.resolve(process.cwd(), 'public/images/parts');
const PUBLIC_IMAGE_FILE = path.join(
  PUBLIC_IMAGE_DIR,
  'navitas-tac2-drive2-440a-conversion-kit.png'
);

const COST = 675;
const SELL_PRICE = 899;
const COMP_PRICE = 931.2;

const PRODUCT = {
  sku: '64-NAVYAMTAC2-G29-4',
  slug: 'navitas-yamaha-drive2-neos-48v-440a-tac2-conversion-kit',
  name: 'Navitas Yamaha Drive2 (NEOS) 48V 440A TAC2 Conversion Kit',
  fsipSku: '64-NAVYAMTAC2-G29-4',
  brand: 'Navitas',
  category: 'Controllers',
  categorySlug: 'controller-kits',
  compatibleModels: ['Yamaha Drive2', 'Yamaha YDRE2', 'Yamaha Drive2 NEOS'],
  description: [
    'Navitas TAC2 440A conversion kit for Yamaha Drive2 (YDRE2) carts with Toyota NEOS “M” type AC controls. Bluetooth-enabled TAC2 controller with CAN support for performance tuning and diagnostics via the Navitas app.',

    'Important: this kit does not include the On-The-Fly (OTF) dash programmer. Speed, regen, and acceleration are adjusted with the Navitas Bluetooth app. OTF is sold separately if you want physical knobs.',

    'Kit includes the TAC2 440A controller with Bluetooth & CAN, TAC2 module, battery cable, and hardware mounting kit/plate. Not the same as the G29/Drive TSX DC kits — this is an AC / NEOS platform upgrade for Drive2 only.',

    'Free ground shipping. Pairs well with a Lithium Rhino 48V Drive2 conversion kit.',
  ].join('\n\n'),
};

async function ensureImageUrl(): Promise<string> {
  mkdirSync(PUBLIC_IMAGE_DIR, { recursive: true });
  const source = existsSync(LOCAL_SOURCE_IMAGE) ? LOCAL_SOURCE_IMAGE : FALLBACK_IMAGE;
  if (!existsSync(source)) throw new Error(`No image source found`);
  copyFileSync(source, PUBLIC_IMAGE_FILE);
  console.log(`✅ Local image: ${PUBLIC_IMAGE_FILE}`);

  const buf = readFileSync(source);
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(IMAGE_STORAGE_PATH, buf, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(IMAGE_STORAGE_PATH);
  console.log(`✅ Storage image: ${data.publicUrl}`);
  return data.publicUrl;
}

async function main() {
  console.log('🚀 Navitas Drive2 TAC2 440A');
  console.log(`   Cost $${COST} | CE $${COMP_PRICE} → Sell $${SELL_PRICE} | free_freight | no OTF\n`);

  const imageUrl = await ensureImageUrl();

  const { data: existing } = await supabase
    .from('parts')
    .select('id, stripe_product_id, stripe_price_id, price_cents')
    .eq('sku', PRODUCT.sku)
    .maybeSingle();

  let stripeProductId = existing?.stripe_product_id as string | undefined;
  if (!stripeProductId) {
    const product = await stripe.products.create({
      name: PRODUCT.name,
      description: PRODUCT.description.slice(0, 500),
      images: [imageUrl],
      metadata: {
        sku: PRODUCT.sku,
        fsip_sku: PRODUCT.fsipSku,
        brand: 'Navitas',
        series: 'TAC2',
        includes_otf: 'false',
      },
    });
    stripeProductId = product.id;
    console.log(`✅ Stripe product: ${stripeProductId}`);
  } else {
    await stripe.products.update(stripeProductId, {
      name: PRODUCT.name,
      description: PRODUCT.description.slice(0, 500),
      images: [imageUrl],
      metadata: {
        sku: PRODUCT.sku,
        fsip_sku: PRODUCT.fsipSku,
        brand: 'Navitas',
        series: 'TAC2',
        includes_otf: 'false',
      },
    });
    console.log(`✅ Stripe product updated: ${stripeProductId}`);
  }

  let stripePriceId = existing?.stripe_price_id as string | undefined;
  if (!stripePriceId || existing?.price_cents !== SELL_PRICE * 100) {
    if (stripePriceId) {
      try {
        await stripe.prices.update(stripePriceId, { active: false });
      } catch {
        // ignore
      }
    }
    const price = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: SELL_PRICE * 100,
      currency: 'usd',
      metadata: { sku: PRODUCT.sku },
    });
    stripePriceId = price.id;
    console.log(`✅ Stripe price: ${stripePriceId}`);
  }

  const metadata = {
    free_freight: true,
    cost_wholesale: COST,
    vendor_supply_chain: 'fsip',
    fsip_sku: PRODUCT.fsipSku,
    series: 'TAC2',
    includes_otf: false,
    cart_fit: 'Yamaha Drive2 / YDRE2 NEOS AC',
    replaces_controllers: 'Toyota NEOS M-type',
    competitor_prices: [
      {
        source: 'cloudelectric',
        price: COMP_PRICE,
        url: 'https://www.cloudelectric.com/product-p/64-navyamtac2-g29-4.htm',
        fetched_at: new Date().toISOString(),
        note: 'CE may show stale pricing; dealer cost supports $899',
      },
    ],
    last_comp_pricing: {
      at: new Date().toISOString(),
      method: 'match_tsx_shelf_under_ce',
      sell: SELL_PRICE,
      cost: COST,
      margin_pct: Math.round(((SELL_PRICE - COST) / SELL_PRICE) * 1000) / 10,
    },
    source: 'fsip_navitas_tac2_drive2',
  };

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: PRODUCT.name,
    slug: PRODUCT.slug,
    sku: PRODUCT.sku,
    oem_reference: PRODUCT.fsipSku,
    brand: PRODUCT.brand,
    category: PRODUCT.category,
    category_slug: PRODUCT.categorySlug,
    description: PRODUCT.description,
    price: SELL_PRICE,
    price_cents: SELL_PRICE * 100,
    sales_type: 'direct',
    is_in_stock: true,
    image_url: imageUrl,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePriceId,
    compatible_models: PRODUCT.compatibleModels,
    voltage: 48,
    amperage: 440,
    metadata,
    updated_at: new Date().toISOString(),
  };

  const { data: upserted, error } = await supabase
    .from('parts')
    .upsert(row, { onConflict: 'sku' })
    .select('id, slug')
    .single();

  if (error) throw new Error(error.message);

  console.log(`\n✅ Live: https://www.flatearthequipment.com/parts/${upserted.slug}`);
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
