/**
 * Add Navitas TAC3 850A + 7.5kW AC conversion kits (FSIP) — Supabase + Stripe.
 *
 * EZGO TXT, Club Car IQ/Excel, Yamaha G29
 * Cost: $1,775 · Sell: $2,399 · Free freight
 * OTF not included (Bluetooth app only)
 *
 * Run: npx tsx scripts/add-navitas-tac3-850a-kits.ts
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
const IMAGE_STORAGE_PATH = 'navitas-tac3-850a-conversion-kit.png';
const LOCAL_SOURCE_IMAGE = path.resolve(
  process.env.HOME || '',
  '.cursor/projects/Users-christopherray-Documents-flat-earth-equipment/assets/navitas-tac3-850a-txt-ecommerce.png'
);
const PUBLIC_IMAGE_DIR = path.resolve(process.cwd(), 'public/images/parts');
const PUBLIC_IMAGE_FILE = path.join(PUBLIC_IMAGE_DIR, 'navitas-tac3-850a-conversion-kit.png');

const COST = 1775;
const SELL_PRICE = 2399;
const COMP_PRICE = 2495;

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
    sku: '222-48VCANTXTTAC33850-7',
    slug: 'navitas-ezgo-txt-48v-850a-tac3-ac-conversion-kit',
    name: 'Navitas EZGO TXT 48/72V 850A TAC3 AC Conversion Kit (7.5kW)',
    fsipSku: '222-48VCANTXTTAC33850-7',
    cartFit: 'E-Z-GO TXT 48V/72V with Curtis 1206HB',
    replaces: 'Curtis 1206HB (DC motor + controller)',
    compatibleModels: ['EZGO TXT', 'EZGO TXT 48V', 'EZGO TXT 72V'],
    description: [
      'Navitas TAC3 850A CAN-enabled DC-to-AC conversion kit for E-Z-GO TXT carts. Replaces the stock DC motor and Curtis 1206HB controller with a high-torque 7.5kW AC motor and 850-amp MOSFET controller for serious speed and hill-climbing performance on 48V or 72V systems.',

      'Bluetooth app tuning, CAN-bus support for smart lithium packs, IP65 sealed controller. This is a full AC drivetrain conversion — not a TSX keep-motor upgrade. Controllers are large and may need custom mounting. OTF programmer is not included; tune via the Navitas Bluetooth app (OTF sold separately).',

      'Kit includes TAC3 850A controller, 7.5kW AC motor, OEM-specific harness, and motor sensor cable. Free ground shipping in the contiguous US. Best paired with a high-discharge Lithium Rhino pack (72V preferred for max performance).',
    ].join('\n\n'),
  },
  {
    sku: '222-48VCANCCTAC3850-7',
    slug: 'navitas-club-car-iq-excel-48v-850a-tac3-ac-conversion-kit',
    name: 'Navitas Club Car IQ/Excel 48/72V 850A TAC3 AC Conversion Kit (7.5kW)',
    fsipSku: '222-48VCANCCTAC3850-7',
    cartFit: 'Club Car IQ/Excel 48V/72V with Curtis 1510/1515',
    replaces: 'Curtis 1510 / 1515 (DC motor + controller)',
    compatibleModels: [
      'Club Car Precedent',
      'Club Car Onward',
      'Club Car Tempo',
      'Club Car DS IQ',
      'Club Car Excel',
    ],
    description: [
      'Navitas TAC3 850A CAN-enabled DC-to-AC conversion kit for Club Car IQ/Excel platforms. Replaces the stock DC motor and Curtis 1510/1515 controller with a 7.5kW AC motor and 850-amp controller — built for high torque, lifted carts, and performance builds on 48V or 72V.',

      'Bluetooth app tuning, CAN lithium communication, IP65 housing. Full AC conversion (not a TSX plug-and-play keep-motor kit). Large controller may require custom mounting. On-The-Fly programmer not included — use the Navitas Bluetooth app.',

      'Kit includes TAC3 850A controller, 7.5kW AC motor, vehicle harness, and motor sensor cable. Free ground shipping in the contiguous US. Pair with a strong Lithium Rhino pack for best results.',
    ].join('\n\n'),
  },
  {
    sku: '222-48VCANYAMTAC3850-7',
    slug: 'navitas-yamaha-g29-48v-850a-tac3-ac-conversion-kit',
    name: 'Navitas Yamaha G29/Drive 48/72V 850A TAC3 AC Conversion Kit (7.5kW)',
    fsipSku: '222-48VCANYAMTAC3850-7',
    cartFit: 'Yamaha G29 / Drive with Moric DC controller',
    replaces: 'Moric OEM DC motor + controller',
    compatibleModels: ['Yamaha G29', 'Yamaha Drive'],
    description: [
      'Navitas TAC3 850A CAN-enabled DC-to-AC conversion kit for Yamaha G29 / Drive carts with Moric DC controls. Swaps the factory DC motor and controller for a 7.5kW AC motor and 850-amp TAC3 controller — extreme performance for hills, speed, and custom builds on 48V or 72V.',

      'Not for Yamaha Drive2 NEOS AC carts (use the Drive2 TAC2 kit instead). Bluetooth app tuning; OTF programmer not included. Controller may need custom mounting.',

      'Kit includes TAC3 850A controller, 7.5kW AC motor, OEM harness, and motor sensor cable. Free ground shipping in the contiguous US.',
    ].join('\n\n'),
  },
];

async function ensureImageUrl(): Promise<string> {
  if (!existsSync(LOCAL_SOURCE_IMAGE)) {
    throw new Error(`Source image missing: ${LOCAL_SOURCE_IMAGE}`);
  }
  mkdirSync(PUBLIC_IMAGE_DIR, { recursive: true });
  copyFileSync(LOCAL_SOURCE_IMAGE, PUBLIC_IMAGE_FILE);
  console.log(`✅ Local image: public/images/parts/navitas-tac3-850a-conversion-kit.png`);

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
        series: 'TAC3',
        includes_otf: 'false',
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
        series: 'TAC3',
        includes_otf: 'false',
      },
    });
    console.log(`  ✅ Stripe product updated: ${stripeProductId}`);
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
      metadata: { sku: kit.sku },
    });
    stripePriceId = price.id;
    console.log(`  ✅ Stripe price: ${stripePriceId}`);
  }

  const metadata = {
    free_freight: true,
    cost_wholesale: COST,
    vendor_supply_chain: 'fsip',
    fsip_sku: kit.fsipSku,
    series: 'TAC3',
    includes_otf: false,
    motor_kw: 7.5,
    cart_fit: kit.cartFit,
    replaces_controllers: kit.replaces,
    weight_lbs: 90,
    competitor_prices: [
      {
        source: 'buggies_unlimited',
        price: COMP_PRICE,
        fetched_at: new Date().toISOString(),
      },
    ],
    last_comp_pricing: {
      at: new Date().toISOString(),
      method: 'under_retail_comp_free_freight',
      sell: SELL_PRICE,
      cost: COST,
      margin_pct: Math.round(((SELL_PRICE - COST) / SELL_PRICE) * 1000) / 10,
    },
    source: 'fsip_navitas_tac3_850',
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
    amperage: 850,
    weight_lbs: 90,
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
    `  ✅ https://www.flatearthequipment.com/parts/${upserted.slug}`
  );
}

async function main() {
  console.log('🚀 Navitas TAC3 850A kits');
  console.log(`   Cost $${COST} → Sell $${SELL_PRICE} | free_freight | no OTF\n`);

  const imageUrl = await ensureImageUrl();
  for (const kit of KITS) {
    console.log(`\n→ ${kit.name}`);
    await upsertKit(kit, imageUrl);
  }
  console.log('\n✅ Done');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
