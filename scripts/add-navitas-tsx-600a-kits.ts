/**
 * Add / reprice Navitas TSX3.0 600A conversion kits (FSIP) — Supabase + Stripe.
 *
 * Phase 1 shelf (DC keep-motor kits w/ OTF):
 *   Club Car IQ/Excel, Club Car/StarEV, EZGO ITS (live reprice), EZGO TXT, Yamaha G29
 *
 * Sell: $899 (under Cloud Electric $930) · Cost: $690 · Free freight
 *
 * Run: npx tsx scripts/add-navitas-tsx-600a-kits.ts
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
const IMAGE_STORAGE_PATH = 'navitas-tsx-600a-conversion-kit.png';
const LOCAL_SOURCE_IMAGE = path.resolve(
  process.env.HOME || '',
  '.cursor/projects/Users-christopherray-Documents-flat-earth-equipment/assets/navitas-tsx-600a-conversion-kit-ecommerce.png'
);
const PUBLIC_IMAGE_DIR = path.resolve(process.cwd(), 'public/images/parts');
const PUBLIC_IMAGE_FILE = path.join(PUBLIC_IMAGE_DIR, 'navitas-tsx-600a-conversion-kit.png');

const COST = 690;
const SELL_PRICE = 899;
const COMP_PRICE = 930;
const COMP_SOURCE = 'cloudelectric';

type Kit = {
  sku: string;
  slug: string;
  name: string;
  fsipSku: string;
  cartFit: string;
  replaces: string;
  description: string;
  compatibleModels: string[];
};

const KITS: Kit[] = [
  {
    sku: '87-TSX3-600CCIQX',
    slug: 'navitas-club-car-iq-excel-48v-600a-conversion-kit',
    name: 'Navitas Club Car IQ/Excel 48V 600A Conversion Kit w/OTF',
    fsipSku: '87-TSX3-600CCIQX',
    cartFit: 'Club Car IQ / Excel / Precedent / DS IQ / Tempo (48V)',
    replaces: 'Curtis 1510 / 1515',
    compatibleModels: [
      'Club Car Precedent',
      'Club Car Tempo',
      'Club Car DS IQ',
      'Club Car Excel',
    ],
    description: [
      'Navitas TSX3.0 600A DC conversion kit for Club Car IQ/Excel 48V carts. Plug-and-play upgrade that keeps your existing separately excited DC motor while adding Bluetooth app tuning, regenerative braking, and the On-The-Fly (OTF) programmer for speed, regen, and acceleration adjustments while driving.',

      'Fits Club Car IQ and Excel systems that use a stock Curtis 1510 or 1515 controller — including many Precedent, Tempo, and DS IQ carts. Confirm your OEM controller before ordering; carts on 1268/1520 use the Club Car/StarEV kit instead.',

      'Kit includes the 600A Bluetooth TSX3.0 controller, vehicle-specific harness, and OTF programmer. Free ground shipping. Pair with a Lithium Rhino 48V pack for full current delivery under load.',
    ].join('\n\n'),
  },
  {
    sku: '87-TSX3-600CCSTR',
    slug: 'navitas-club-car-starev-48v-600a-conversion-kit',
    name: 'Navitas Club Car/StarEV 48V 600A Conversion Kit w/OTF',
    fsipSku: '87-TSX3-600CCSTR',
    cartFit: 'Club Car / StarEV 48V with Curtis 1268/1520',
    replaces: 'Curtis 1268 / 1520',
    compatibleModels: ['Club Car', 'StarEV'],
    description: [
      'Navitas TSX3.0 600A DC conversion kit for Club Car and StarEV 48V carts running a stock Curtis 1268 or 1520 controller. Keeps your existing DC motor and adds Bluetooth app control, regen braking, and the On-The-Fly programmer.',

      'Not the same harness as Club Car IQ/Excel (1510/1515) kits — match your OEM controller number before ordering.',

      'Kit includes the 600A Bluetooth TSX3.0 controller, vehicle-specific harness, and OTF programmer. Free ground shipping. Works great alongside a Lithium Rhino 48V conversion kit.',
    ].join('\n\n'),
  },
  {
    sku: 'NA600KIT',
    slug: 'navitas-ezgo-series-its-36-48v-600a-conversion-kit',
    name: 'Navitas E-Z-GO ITS 48V 600A Conversion Kit w/OTF',
    fsipSku: '87-TSX3-600E2ITS',
    cartFit: 'E-Z-GO ITS / PDS 48V',
    replaces: 'Curtis 1268 / 1264',
    compatibleModels: ['EZGO ITS', 'EZGO PDS', 'EZGO TXT PDS'],
    description: [
      'Navitas TSX3.0 600A DC conversion kit for E-Z-GO ITS 48V systems. Plug-and-play controller upgrade with Bluetooth tuning, regenerative braking, and On-The-Fly programmer — keeps your stock separately excited DC motor.',

      'Replaces Curtis 1268/1264 controllers on ITS-equipped E-Z-GO carts. For TXT carts with a Curtis 1206HB, use the dedicated TXT kit instead.',

      'Kit includes the 600A Bluetooth TSX3.0 controller, vehicle-specific harness, and OTF programmer. Free ground shipping. Ideal companion upgrade when converting to Lithium Rhino.',
    ].join('\n\n'),
  },
  {
    sku: '87-TSX3-600EZTXT',
    slug: 'navitas-ezgo-txt-48v-600a-conversion-kit',
    name: 'Navitas E-Z-GO TXT 48V 600A Conversion Kit w/OTF',
    fsipSku: '87-TSX3-600EZTXT',
    cartFit: 'E-Z-GO TXT 48V',
    replaces: 'Curtis 1206HB',
    compatibleModels: ['EZGO TXT', 'EZGO TXT 48V'],
    description: [
      'Navitas TSX3.0 600A DC conversion kit for E-Z-GO TXT 48V carts. The most common plug-and-play controller upgrade for TXT owners going lithium — Bluetooth app, regen braking, and On-The-Fly speed/accel/regen control while keeping the stock DC motor.',

      'Replaces the stock Curtis 1206HB controller. ITS/PDS carts need the ITS kit, not this TXT harness.',

      'Kit includes the 600A Bluetooth TSX3.0 controller, vehicle-specific harness, and OTF programmer. Free ground shipping. Pair with a Lithium Rhino 48V 105Ah kit for the full conversion package.',
    ].join('\n\n'),
  },
  {
    sku: '87-TSX3-600YG29',
    slug: 'navitas-yamaha-g29-drive-48v-600a-conversion-kit',
    name: 'Navitas Yamaha G29/Drive 48V 600A Conversion Kit w/OTF',
    fsipSku: '87-TSX3-600YG29',
    cartFit: 'Yamaha G29 / Drive 48V',
    replaces: 'Stock Yamaha G29 / Drive controller',
    compatibleModels: ['Yamaha G29', 'Yamaha Drive', 'Yamaha Drive 48V'],
    description: [
      'Navitas TSX3.0 600A DC conversion kit for Yamaha G29 and Drive 48V carts. Plug-and-play upgrade that keeps your existing DC motor while adding Bluetooth app tuning, regenerative braking, and the On-The-Fly programmer.',

      'Confirm your cart is a G29/Drive DC platform before ordering. Drive2 AC systems need a different (AC) conversion path.',

      'Kit includes the 600A Bluetooth TSX3.0 controller, vehicle-specific harness, and OTF programmer. Free ground shipping. Pairs cleanly with Lithium Rhino 48V conversion kits.',
    ].join('\n\n'),
  },
];

async function ensureImageUrl(): Promise<string> {
  if (!existsSync(LOCAL_SOURCE_IMAGE)) {
    throw new Error(`Source image missing: ${LOCAL_SOURCE_IMAGE}`);
  }

  mkdirSync(PUBLIC_IMAGE_DIR, { recursive: true });
  copyFileSync(LOCAL_SOURCE_IMAGE, PUBLIC_IMAGE_FILE);
  console.log(`✅ Local image: public/images/parts/navitas-tsx-600a-conversion-kit.png`);

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
        // ignore archive failures on legacy prices
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
    cost_wholesale: COST,
    vendor_supply_chain: 'fsip',
    fsip_sku: kit.fsipSku,
    cart_fit: kit.cartFit,
    replaces_controllers: kit.replaces,
    competitor_prices: [
      {
        source: COMP_SOURCE,
        price: COMP_PRICE,
        note: 'Club Car IQ/Excel 600A reference; line priced consistently',
        fetched_at: new Date().toISOString(),
      },
    ],
    last_comp_pricing: {
      at: new Date().toISOString(),
      method: 'under_cloudelectric_with_margin',
      sell: SELL_PRICE,
      cost: COST,
      margin_pct: Math.round(((SELL_PRICE - COST) / SELL_PRICE) * 1000) / 10,
    },
    source: 'fsip_navitas_tsx_phase1',
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
    amperage: 600,
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
  console.log('🚀 Navitas TSX 600A Phase 1 kits');
  console.log(`   Cost $${COST} | Comp $${COMP_PRICE} → Sell $${SELL_PRICE} | free_freight\n`);

  const imageUrl = await ensureImageUrl();

  for (const kit of KITS) {
    console.log(`\n→ ${kit.name}`);
    await upsertKit(kit, imageUrl);
  }

  const margin = (((SELL_PRICE - COST) / SELL_PRICE) * 100).toFixed(1);
  console.log(`\n✅ Done. Margin ${margin}% ($${SELL_PRICE - COST} gross) · free ground freight`);
  console.log('   Next: npx tsx scripts/build-merchant-feed.ts && commit feed + image');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
