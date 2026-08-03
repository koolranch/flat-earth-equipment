/**
 * Delta-Q wave 1 — new / no-core chargers + AC cord accessories (FSIP).
 *
 * Chargers:
 *   23-9124800  QuiQ Standard 48V 18A     cost $475.30 → sell $579
 *   23-9400001  IC650 Base 24V 27.1A      cost $415.52 → sell $605
 *   23-9400001S004 IC650 AWP kit          cost $425.32 → sell $609
 *
 * Accessories (separate SKUs):
 *   23-4750008  QuiQ AC cord              cost $23.52  → sell $39
 *   23-4750496  IC650 lock AC cord        cost $33.32  → sell $47
 *   23-9000111  IC650 handle/feet         cost $15.68  → sell $29
 *
 * Run: npx tsx scripts/add-delta-q-chargers-wave1.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
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
const PUBLIC_IMAGE_DIR = path.resolve(process.cwd(), 'public/images/parts');

type ProductDef = {
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  cost: number;
  sell: number;
  compPrice: number;
  compNote: string;
  voltage: number | null;
  amperage: number | null;
  oemReference: string;
  fsipImageId: number;
  fsipImageVersion: number;
  /** Prefer a known-good absolute image URL when FSIP stock art is wrong/shared. */
  imageUrlOverride?: string;
  description: string;
  compatibleModels: string[];
  requiredAccessorySlug?: string;
  optionalAccessorySlug?: string;
  isAccessory?: boolean;
};

const PRODUCTS: ProductDef[] = [
  {
    sku: '23-9124800',
    slug: 'delta-q-quiq-48v-18a-charger-9124800',
    name: 'Delta-Q QuiQ Standard 48V 18A (1000W) Battery Charger',
    brand: 'Delta-Q',
    category: 'Battery Chargers',
    categorySlug: 'battery-chargers',
    cost: 475.3,
    sell: 579,
    compPrice: 608.19,
    compNote: 'Cloud Electric brand-new QuiQ 48V 18A',
    voltage: 48,
    amperage: 18,
    oemReference: '912-4800',
    fsipImageId: 1920,
    fsipImageVersion: 2,
    // FSIP thumbnail 1920 is a mislabeled 912-2400 stock photo; use CE product art.
    imageUrlOverride:
      'https://cdn4.volusion.store/zbjnk-styma/v/vspfiles/photos/FSIP-23-9124800-2.png?v-cache=1715806022',
    requiredAccessorySlug: 'delta-q-quiq-ac-cord-23-4750008',
    compatibleModels: ['Golf cart 48V', 'Industrial EV 48V', 'Utility vehicle 48V'],
    description: [
      'Brand-new Delta-Q QuiQ Standard onboard charger — 48V, 18A, 1000W. IP66 sealed enclosure with high-frequency electronics, ring-terminal DC leads, temperature sensor, and interlock. Built for lead-acid packs (wet/AGM/gel); lithium profiles available when you provide battery make and model at order.',
      'AC cable is not included. Most buyers also need the matching QuiQ AC cord (sold separately). After checkout, email parts@flatearthequipment.com with your battery brand/model so we can confirm the charge profile before we ship.',
      'OEM cross-reference: Delta-Q 912-4800. Genuine new unit — no core charge, no reman exchange.',
    ].join('\n\n'),
  },
  {
    sku: '23-9400001',
    slug: 'delta-q-ic650-24v-27a-charger-9400001',
    name: 'Delta-Q IC650 24V 27.1A (650W) Base Battery Charger',
    brand: 'Delta-Q',
    category: 'Battery Chargers',
    categorySlug: 'battery-chargers',
    cost: 415.52,
    sell: 605,
    compPrice: 637.29,
    compNote: 'Cloud Electric / Lift Parts Warehouse IC650 9400001',
    voltage: 24,
    amperage: 27,
    oemReference: '940-0001',
    fsipImageId: 1902,
    fsipImageVersion: 4,
    requiredAccessorySlug: 'delta-q-ic650-lock-ac-cord-23-4750496',
    optionalAccessorySlug: 'delta-q-ic650-handle-feet-kit-23-9000111',
    compatibleModels: ['Scissor lift 24V', 'Boom lift 24V', 'Aerial work platform 24V'],
    description: [
      'Brand-new Delta-Q IC650 base charger — 24V, 27.1A, 650W. Compact IP66 onboard unit used across many aerial work platforms and industrial 24V packs. Not CAN-compatible — confirm your machine does not require a CAN IC650 before ordering.',
      'AC and DC cables are not included. Add the IC650 locking AC cord to plug into wall power. Optional handle and rubber feet kit available for portable mounting. Provide battery make and model after order for the correct charge profile (required for lithium).',
      'OEM cross-reference: Delta-Q 940-0001. Genuine new — no core charge.',
    ].join('\n\n'),
  },
  {
    sku: '23-9400001S004',
    slug: 'delta-q-ic650-24v-awp-replacement-kit-9400001s004',
    name: 'Delta-Q IC650 24V AWP Replacement Kit (w/o Interlock)',
    brand: 'Delta-Q',
    category: 'Battery Chargers',
    categorySlug: 'battery-chargers',
    cost: 425.32,
    sell: 609,
    compPrice: 637.29,
    compNote: 'Cloud Electric IC650 new comps; AWP kit configuration',
    voltage: 24,
    amperage: 27,
    oemReference: '940-0001',
    fsipImageId: 2016,
    fsipImageVersion: 2,
    requiredAccessorySlug: 'delta-q-ic650-lock-ac-cord-23-4750496',
    optionalAccessorySlug: 'delta-q-ic650-handle-feet-kit-23-9000111',
    compatibleModels: [
      'JLG scissor lift',
      'Genie scissor lift',
      'Aerial work platform 24V',
    ],
    description: [
      'Brand-new Delta-Q IC650 AWP replacement kit (without interlock) — 24V, 27A, 650W. Configured for common aerial work platform charger swaps where an interlock circuit is not required. Same IC650 sealed electronics as the base unit; not CAN-compatible.',
      'AC/DC cables are not included — add the IC650 locking AC cord. Send battery make and model after purchase for charge-profile programming (required for lithium packs).',
      'OEM family: Delta-Q 940-0001 / IC650. Genuine new — no core charge.',
    ].join('\n\n'),
  },
  {
    sku: '23-4750008',
    slug: 'delta-q-quiq-ac-cord-23-4750008',
    name: 'Delta-Q QuiQ AC Cord 6.5\' 14 AWG',
    brand: 'Delta-Q',
    category: 'Battery Chargers',
    categorySlug: 'battery-chargers',
    cost: 23.52,
    sell: 39,
    compPrice: 39,
    compNote: 'FSIP list / accessory attach',
    voltage: null,
    amperage: null,
    oemReference: '4750008',
    fsipImageId: 1769,
    fsipImageVersion: 4,
    isAccessory: true,
    compatibleModels: [],
    description: [
      'Replacement AC power cord for Delta-Q QuiQ onboard chargers. 6.5 ft, 14 AWG, with the QuiQ-compatible AC connector. Required if your QuiQ charger did not ship with a cord or the original cord is damaged.',
      'Pairs with the Delta-Q QuiQ Standard 48V 18A charger and other QuiQ models that use this AC inlet.',
    ].join('\n\n'),
  },
  {
    sku: '23-4750496',
    slug: 'delta-q-ic650-lock-ac-cord-23-4750496',
    name: 'Delta-Q IC650 Lock AC Cord 6.5\' 16 AWG',
    brand: 'Delta-Q',
    category: 'Battery Chargers',
    categorySlug: 'battery-chargers',
    cost: 33.32,
    sell: 47,
    compPrice: 41.21,
    compNote: 'Cloud Electric accessory listing; priced for margin',
    voltage: null,
    amperage: null,
    oemReference: '4750496',
    fsipImageId: 1768,
    fsipImageVersion: 4,
    isAccessory: true,
    compatibleModels: [],
    description: [
      'Locking AC power cord for Delta-Q IC650 chargers. 6.5 ft, 16 AWG, with the IC650 lock connector. Required to plug an IC650 base or AWP kit into wall power when a cord is not already on the machine.',
      'Fits Delta-Q IC650 24V chargers including 940-0001 base and AWP replacement kits.',
    ].join('\n\n'),
  },
  {
    sku: '23-9000111',
    slug: 'delta-q-ic650-handle-feet-kit-23-9000111',
    name: 'Delta-Q IC650 Handle & Rubber Feet Kit',
    brand: 'Delta-Q',
    category: 'Battery Chargers',
    categorySlug: 'battery-chargers',
    cost: 15.68,
    sell: 29,
    compPrice: 25.6,
    compNote: 'FSIP accessory list',
    voltage: null,
    amperage: null,
    oemReference: '9000111',
    fsipImageId: 2005,
    fsipImageVersion: 2,
    isAccessory: true,
    compatibleModels: [],
    description: [
      'Optional handle and rubber feet kit for Delta-Q IC650 chargers. Useful when the charger is used as a portable / bench unit instead of hard-mounted on the machine.',
      'Does not include AC or DC cables. Compatible with IC650 940-0001 family chargers.',
    ].join('\n\n'),
  },
];

async function downloadAndStoreImage(def: ProductDef): Promise<string> {
  const ext = def.imageUrlOverride?.includes('.png') ? 'png' : 'jpg';
  const fileName = `${def.slug}.${ext}`;
  const storagePath = fileName;
  const publicPath = path.join(PUBLIC_IMAGE_DIR, fileName);
  const src =
    def.imageUrlOverride ??
    `https://shop.fsip.biz/en/image/getthumbnail/${def.fsipImageId}?width=800&height=800&version=${def.fsipImageVersion}&s=001`;

  console.log(`  📷 Fetching image…`);
  const res = await fetch(src, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`Image download failed ${def.sku}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  mkdirSync(PUBLIC_IMAGE_DIR, { recursive: true });
  writeFileSync(publicPath, buf);

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, buf, {
    contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
    upsert: true,
  });
  if (error) throw new Error(`Storage upload ${def.sku}: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function upsertProduct(def: ProductDef, imageUrl: string) {
  const { data: existing } = await supabase
    .from('parts')
    .select('id, stripe_product_id, stripe_price_id, price_cents')
    .eq('sku', def.sku)
    .maybeSingle();

  let stripeProductId = existing?.stripe_product_id as string | undefined;
  const productMeta = {
    sku: def.sku,
    fsip_sku: def.sku,
    brand: def.brand,
    oem_reference: def.oemReference,
  };

  if (!stripeProductId) {
    const product = await stripe.products.create({
      name: def.name,
      description: def.description.slice(0, 500),
      images: [imageUrl],
      metadata: productMeta,
    });
    stripeProductId = product.id;
    console.log(`  ✅ Stripe product: ${stripeProductId}`);
  } else {
    await stripe.products.update(stripeProductId, {
      name: def.name,
      description: def.description.slice(0, 500),
      images: [imageUrl],
      metadata: productMeta,
    });
    console.log(`  ✅ Stripe product updated: ${stripeProductId}`);
  }

  let stripePriceId = existing?.stripe_price_id as string | undefined;
  const sellCents = Math.round(def.sell * 100);
  const needsNewPrice = !stripePriceId || existing?.price_cents !== sellCents;
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
      unit_amount: sellCents,
      currency: 'usd',
      metadata: { sku: def.sku, fsip_sku: def.sku },
    });
    stripePriceId = price.id;
    console.log(`  ✅ Stripe price: ${stripePriceId} ($${def.sell})`);
  } else {
    console.log(`  ⏭️  Stripe price unchanged: ${stripePriceId}`);
  }

  const metadata: Record<string, unknown> = {
    cost_wholesale: def.cost,
    vendor_supply_chain: 'fsip',
    fsip_sku: def.sku,
    oem_part_number: def.oemReference,
    condition: 'new',
    has_core_charge: false,
    competitor_prices: [
      {
        source: 'cloudelectric',
        price: def.compPrice,
        note: def.compNote,
        fetched_at: new Date().toISOString(),
      },
    ],
    last_comp_pricing: {
      at: new Date().toISOString(),
      method: 'under_comp_with_margin',
      sell: def.sell,
      cost: def.cost,
      margin_pct: Math.round(((def.sell - def.cost) / def.sell) * 1000) / 10,
    },
    source: 'fsip_delta_q_wave1',
  };

  if (def.requiredAccessorySlug) {
    metadata.required_accessory_slug = def.requiredAccessorySlug;
  }
  if (def.optionalAccessorySlug) {
    metadata.optional_accessory_slug = def.optionalAccessorySlug;
  }
  if (def.isAccessory) {
    metadata.is_charger_accessory = true;
  }
  if (def.sku.startsWith('23-9400001')) {
    metadata.can_compatible = false;
    metadata.programming_required = true;
  }
  if (def.sku === '23-9124800') {
    metadata.programming_required = true;
  }

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: def.name,
    slug: def.slug,
    sku: def.sku,
    oem_reference: def.oemReference,
    vendor_sku: def.sku,
    brand: def.brand,
    category: def.category,
    category_slug: def.categorySlug,
    description: def.description,
    price: def.sell,
    price_cents: sellCents,
    sales_type: 'direct',
    is_in_stock: true,
    has_core_charge: false,
    core_charge: 0,
    image_url: imageUrl,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePriceId,
    compatible_models: def.compatibleModels.length ? def.compatibleModels : null,
    voltage: def.voltage,
    amperage: def.amperage,
    metadata,
    updated_at: new Date().toISOString(),
  };

  const { data: upserted, error } = await supabase
    .from('parts')
    .upsert(row, { onConflict: 'sku' })
    .select('id, slug, sku')
    .single();

  if (error) throw new Error(`${def.sku}: ${error.message}`);

  console.log(
    `  ✅ https://www.flatearthequipment.com/parts/${upserted.slug}`
  );
}

async function main() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing STRIPE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('🚀 Delta-Q wave 1 (new / no-core)\n');

  // Accessories first so charger related_slug targets exist conceptually
  const ordered = [
    ...PRODUCTS.filter((p) => p.isAccessory),
    ...PRODUCTS.filter((p) => !p.isAccessory),
  ];

  for (const def of ordered) {
    console.log(`\n→ ${def.name} (${def.sku})`);
    const imageUrl = await downloadAndStoreImage(def);
    const localJpg = path.join(PUBLIC_IMAGE_DIR, `${def.slug}.jpg`);
    const localPng = path.join(PUBLIC_IMAGE_DIR, `${def.slug}.png`);
    if (!existsSync(localJpg) && !existsSync(localPng)) {
      throw new Error(`Public image missing for ${def.slug}`);
    }
    await upsertProduct(def, imageUrl);
  }

  console.log('\n✅ Done. Wave 1 live in Supabase + Stripe.');
  console.log('   Chargers link to cord SKUs via metadata.required_accessory_slug');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
