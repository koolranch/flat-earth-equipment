/**
 * Add Navitas TSX3.0 440A conversion kits (FSIP) — Supabase + Stripe.
 *
 * Same five carts as the 600A shelf (good/better ladder).
 * Sell: $719 · Free freight · OTF included
 *
 * Run: npx tsx scripts/add-navitas-tsx-440a-kits.ts
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
const IMAGE_STORAGE_PATH = 'navitas-tsx-440a-conversion-kit.png';
const LOCAL_SOURCE_IMAGE = path.resolve(
  process.env.HOME || '',
  '.cursor/projects/Users-christopherray-Documents-flat-earth-equipment/assets/navitas-tsx-440a-conversion-kit-ecommerce.png'
);
const PUBLIC_IMAGE_DIR = path.resolve(process.cwd(), 'public/images/parts');
const PUBLIC_IMAGE_FILE = path.join(PUBLIC_IMAGE_DIR, 'navitas-tsx-440a-conversion-kit.png');

const SELL_PRICE = 719;

type Kit = {
  sku: string;
  slug: string;
  name: string;
  fsipSku: string;
  cartFit: string;
  replaces: string;
  cost: number;
  compPrice: number;
  description: string;
  compatibleModels: string[];
  sibling600Slug: string;
};

const KITS: Kit[] = [
  {
    sku: '87-TSX3-440CCIQX',
    slug: 'navitas-club-car-iq-excel-48v-440a-conversion-kit',
    name: 'Navitas Club Car IQ/Excel 48V 440A Conversion Kit w/OTF',
    fsipSku: '87-TSX3-440CCIQX',
    cartFit: 'Club Car IQ / Excel / Precedent / DS IQ / Tempo (48V)',
    replaces: 'Curtis 1510 / 1515',
    cost: 565,
    compPrice: 741,
    sibling600Slug: 'navitas-club-car-iq-excel-48v-600a-conversion-kit',
    compatibleModels: [
      'Club Car Precedent',
      'Club Car Tempo',
      'Club Car DS IQ',
      'Club Car Excel',
    ],
    description: [
      'Navitas TSX3.0 440A DC conversion kit for Club Car IQ/Excel 48V carts. Plug-and-play upgrade that keeps your existing separately excited DC motor while adding Bluetooth app tuning, regenerative braking, and the On-The-Fly (OTF) programmer.',

      'Fits Club Car IQ and Excel systems that use a stock Curtis 1510 or 1515 controller — including many Precedent, Tempo, and DS IQ carts. For maximum torque on hills or lifted builds, step up to the matching 600A kit.',

      'Kit includes the 440A Bluetooth TSX3.0 controller, vehicle-specific harness, and OTF programmer. Free ground shipping. Pair with a Lithium Rhino 48V pack for full current delivery under load.',
    ].join('\n\n'),
  },
  {
    sku: '87-TSX3-440CCSTR',
    slug: 'navitas-club-car-starev-48v-440a-conversion-kit',
    name: 'Navitas Club Car/StarEV 48V 440A Conversion Kit w/OTF',
    fsipSku: '87-TSX3-440CCSTR',
    cartFit: 'Club Car / StarEV 48V with Curtis 1268/1520',
    replaces: 'Curtis 1268 / 1520',
    cost: 573,
    compPrice: 741,
    sibling600Slug: 'navitas-club-car-starev-48v-600a-conversion-kit',
    compatibleModels: ['Club Car', 'StarEV'],
    description: [
      'Navitas TSX3.0 440A DC conversion kit for Club Car and StarEV 48V carts running a stock Curtis 1268 or 1520 controller. Keeps your existing DC motor and adds Bluetooth app control, regen braking, and the On-The-Fly programmer.',

      'Not the same harness as Club Car IQ/Excel (1510/1515) kits — match your OEM controller number before ordering. Need more amps? See the matching 600A StarEV kit.',

      'Kit includes the 440A Bluetooth TSX3.0 controller, vehicle-specific harness, and OTF programmer. Free ground shipping.',
    ].join('\n\n'),
  },
  {
    sku: '87-TSX3-440EZITS',
    slug: 'navitas-ezgo-its-48v-440a-conversion-kit',
    name: 'Navitas E-Z-GO ITS 48V 440A Conversion Kit w/OTF',
    fsipSku: '87-TSX3-440EZITS',
    cartFit: 'E-Z-GO ITS / PDS 48V',
    replaces: 'Curtis 1268 / 1264',
    cost: 565,
    compPrice: 898,
    sibling600Slug: 'navitas-ezgo-series-its-36-48v-600a-conversion-kit',
    compatibleModels: ['EZGO ITS', 'EZGO PDS', 'EZGO TXT PDS'],
    description: [
      'Navitas TSX3.0 440A DC conversion kit for E-Z-GO ITS 48V systems. Plug-and-play controller upgrade with Bluetooth tuning, regenerative braking, and On-The-Fly programmer — keeps your stock separately excited DC motor.',

      'Replaces Curtis 1268/1264 controllers on ITS-equipped E-Z-GO carts. For TXT carts with a Curtis 1206HB, use the dedicated TXT kit instead. Want more torque? Step up to the ITS 600A kit.',

      'Kit includes the 440A Bluetooth TSX3.0 controller, vehicle-specific harness, and OTF programmer. Free ground shipping.',
    ].join('\n\n'),
  },
  {
    sku: '87-TSX3-440EZTXT',
    slug: 'navitas-ezgo-txt-48v-440a-conversion-kit',
    name: 'Navitas E-Z-GO TXT 48V 440A Conversion Kit w/OTF',
    fsipSku: '87-TSX3-440EZTXT',
    cartFit: 'E-Z-GO TXT 48V',
    replaces: 'Curtis 1206HB',
    cost: 565,
    compPrice: 741,
    sibling600Slug: 'navitas-ezgo-txt-48v-600a-conversion-kit',
    compatibleModels: ['EZGO TXT', 'EZGO TXT 48V'],
    description: [
      'Navitas TSX3.0 440A DC conversion kit for E-Z-GO TXT 48V carts. Solid entry upgrade for TXT owners going lithium — Bluetooth app, regen braking, and On-The-Fly control while keeping the stock DC motor.',

      'Replaces the stock Curtis 1206HB controller. ITS/PDS carts need the ITS kit, not this TXT harness. For hills, lifts, or heavier loads, choose the TXT 600A kit.',

      'Kit includes the 440A Bluetooth TSX3.0 controller, vehicle-specific harness, and OTF programmer. Free ground shipping. Pair with a Lithium Rhino 48V conversion kit.',
    ].join('\n\n'),
  },
  {
    sku: '87-TSX3-440YG29',
    slug: 'navitas-yamaha-g29-drive-48v-440a-conversion-kit',
    name: 'Navitas Yamaha G29/Drive 48V 440A Conversion Kit w/OTF',
    fsipSku: '87-TSX3-440YG29',
    cartFit: 'Yamaha G29 / Drive 48V',
    replaces: 'Stock Yamaha G29 / Drive (Moric) controller',
    cost: 565,
    compPrice: 741,
    sibling600Slug: 'navitas-yamaha-g29-drive-48v-600a-conversion-kit',
    compatibleModels: ['Yamaha G29', 'Yamaha Drive', 'Yamaha Drive 48V'],
    description: [
      'Navitas TSX3.0 440A DC conversion kit for Yamaha G29 and Drive 48V carts. Plug-and-play upgrade that keeps your existing DC motor while adding Bluetooth app tuning, regenerative braking, and the On-The-Fly programmer.',

      'Confirm your cart is a G29/Drive DC platform before ordering. Drive2 AC / NEOS systems need a TAC2 kit, not this TSX harness. For more amps, see the matching G29/Drive 600A kit.',

      'Kit includes the 440A Bluetooth TSX3.0 controller, vehicle-specific harness, and OTF programmer. Free ground shipping.',
    ].join('\n\n'),
  },
];

async function ensureImageUrl(): Promise<string> {
  if (!existsSync(LOCAL_SOURCE_IMAGE)) {
    throw new Error(`Source image missing: ${LOCAL_SOURCE_IMAGE}`);
  }

  mkdirSync(PUBLIC_IMAGE_DIR, { recursive: true });
  copyFileSync(LOCAL_SOURCE_IMAGE, PUBLIC_IMAGE_FILE);
  console.log(`✅ Local image: public/images/parts/navitas-tsx-440a-conversion-kit.png`);

  const buf = readFileSync(LOCAL_SOURCE_IMAGE);
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(IMAGE_STORAGE_PATH, buf, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(IMAGE_STORAGE_PATH);
  console.log(`✅ Storage image: ${data.publicUrl}`);
  return data.publicUrl;
}

async function upsertKit(kit: Kit, imageUrl: string) {
  const { data: existing } = await supabase
    .from('parts')
    .select('id, stripe_product_id, stripe_price_id, price_cents')
    .eq('sku', kit.sku)
    .maybeSingle();

  let stripeProductId = existing?.stripe_product_id as string | undefined;
  if (!stripeProductId) {
    const product = await stripe.products.create({
      name: kit.name,
      description: kit.description.slice(0, 500),
      images: [imageUrl],
      metadata: {
        sku: kit.sku,
        fsip_sku: kit.fsipSku,
        brand: 'Navitas',
        replaces: kit.replaces,
        amperage: '440',
      },
    });
    stripeProductId = product.id;
    console.log(`  ✅ Stripe product: ${stripeProductId}`);
  } else {
    await stripe.products.update(stripeProductId, {
      name: kit.name,
      description: kit.description.slice(0, 500),
      images: [imageUrl],
      metadata: {
        sku: kit.sku,
        fsip_sku: kit.fsipSku,
        brand: 'Navitas',
        replaces: kit.replaces,
        amperage: '440',
      },
    });
    console.log(`  ✅ Stripe product updated: ${stripeProductId}`);
  }

  let stripePriceId = existing?.stripe_price_id as string | undefined;
  const needsNewPrice = !stripePriceId || existing?.price_cents !== SELL_PRICE * 100;
  if (needsNewPrice) {
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
      metadata: { sku: kit.sku, fsip_sku: kit.fsipSku },
    });
    stripePriceId = price.id;
    console.log(`  ✅ Stripe price: ${stripePriceId} ($${SELL_PRICE})`);
  } else {
    console.log(`  ⏭️  Stripe price unchanged: ${stripePriceId}`);
  }

  const metadata = {
    free_freight: true,
    cost_wholesale: kit.cost,
    vendor_supply_chain: 'fsip',
    fsip_sku: kit.fsipSku,
    cart_fit: kit.cartFit,
    replaces_controllers: kit.replaces,
    sibling_600a_slug: kit.sibling600Slug,
    competitor_prices: [
      {
        source: 'cloudelectric',
        price: kit.compPrice,
        fetched_at: new Date().toISOString(),
      },
    ],
    last_comp_pricing: {
      at: new Date().toISOString(),
      method: 'under_cloudelectric_hub_ladder',
      sell: SELL_PRICE,
      cost: kit.cost,
      margin_pct: Math.round(((SELL_PRICE - kit.cost) / SELL_PRICE) * 1000) / 10,
    },
    source: 'fsip_navitas_tsx_440_phase2',
  };

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: kit.name,
    slug: kit.slug,
    sku: kit.sku,
    oem_reference: kit.fsipSku,
    brand: 'Navitas',
    category: 'Controllers',
    category_slug: 'controller-kits',
    description: kit.description,
    price: SELL_PRICE,
    price_cents: SELL_PRICE * 100,
    sales_type: 'direct',
    is_in_stock: true,
    image_url: imageUrl,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePriceId,
    compatible_models: kit.compatibleModels,
    voltage: 48,
    amperage: 440,
    metadata,
    updated_at: new Date().toISOString(),
  };

  const { data: upserted, error } = await supabase
    .from('parts')
    .upsert(row, { onConflict: 'sku' })
    .select('id, slug, sku')
    .single();

  if (error) throw new Error(`${kit.sku}: ${error.message}`);

  console.log(
    `  ✅ Supabase ${upserted.sku} → https://www.flatearthequipment.com/parts/${upserted.slug}`
  );
}

async function main() {
  console.log('🚀 Navitas TSX 440A Phase 2 kits');
  console.log(`   Sell $${SELL_PRICE} | free_freight | good/better vs $899 600A\n`);

  const imageUrl = await ensureImageUrl();

  for (const kit of KITS) {
    console.log(`\n→ ${kit.name}`);
    await upsertKit(kit, imageUrl);
  }

  console.log(`\n✅ Done. Next: update hub constants + rebuild merchant feed`);
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
