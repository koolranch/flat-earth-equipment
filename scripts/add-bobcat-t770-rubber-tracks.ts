/**
 * Add Bobcat T770 rubber tracks — Supabase + Stripe.
 *
 * T770 standard size is 450x86x55 (55 links) — NOT the T650 450x86x52.
 * Fill in costs + serial_prefixes after verifying every vendor serial break,
 * then run: npx tsx scripts/add-bobcat-t770-rubber-tracks.ts
 *
 * Comp reference (single track, 2026-07-03): Fortis ~$1,494; Monster Tires range.
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
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

/** Verified 2026-07-06 against vendor lookup for AUYB, A3P9, A3P8 — same 3 SKUs on every break. */
const SERIAL_PREFIXES = ['AUYB', 'A3P9', 'A3P8'];

const SHARED_COPY = [
  'Free shipping and a 2-year warranty on every rubber track — no freight surcharge at checkout.',

  `Verified fitment for all Bobcat T770 serial numbers, covering serial prefixes ${SERIAL_PREFIXES.join(', ')}. Not sure which prefix your machine is? Find your serial plate with our Bobcat serial number lookup and match the first four characters.`,

  'Most operators replace tracks in pairs: running a new track opposite a worn one causes uneven loading that shortens the life of both. Order quantity 2 for a full set.',
].join('\n\n');

type TrackSku = {
  sku: string;
  slug: string;
  name: string;
  size: string;
  treadPattern: string;
  cost: number;
  sellPrice: number;
  vendorPn: string;
  intro: string;
};

const TRACKS: TrackSku[] = [
  {
    sku: 'RT-T770-450X86X55-C',
    slug: 'bobcat-t770-rubber-track-450x86x55',
    name: 'Bobcat T770 Rubber Track 450x86x55 C Pattern',
    size: '450x86x55',
    treadPattern: 'C pattern',
    cost: 1275,
    sellPrice: 1449,
    vendorPn: 'TSA/SY450X86X55C',
    intro:
      'Replacement rubber track for the Bobcat T770 compact track loader in the standard 450mm width — 450mm wide, 86mm pitch, 55 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
  },
  {
    sku: 'RT-T770-450X84X56-C',
    slug: 'bobcat-t770-rubber-track-450x84x56',
    name: 'Bobcat T770 Rubber Track 450x84x56 C Pattern',
    size: '450x84x56',
    treadPattern: 'C pattern',
    cost: 1350,
    sellPrice: 1595,
    vendorPn: 'TSA/SY44454322',
    intro:
      'Replacement rubber track for the Bobcat T770 in the 84mm-pitch interchange configuration — 450mm wide, 84mm pitch, 56 links. Confirm pitch on your current track before ordering; this is not the same as the standard 450x86x55.',
  },
  {
    sku: 'RT-T770-320X84X56-C',
    slug: 'bobcat-t770-rubber-track-320x84x56',
    name: 'Bobcat T770 Rubber Track 320x84x56 C Pattern',
    size: '320x84x56',
    treadPattern: 'C pattern',
    cost: 715.01,
    sellPrice: 949,
    vendorPn: 'TSA/SY320X84X56C',
    intro:
      'Replacement rubber track for Bobcat T770 compact track loaders running the narrow 320mm track option — 320mm wide, 84mm pitch, 56 links. Measure your current track width before ordering; most T770s run the 450mm-wide track.',
  },
];

async function addTrack(t: TrackSku) {
  if (!t.cost || !t.sellPrice) {
    throw new Error(`${t.sku}: cost and sellPrice must be set before publishing`);
  }

  console.log(`\n🚀 ${t.name}`);
  console.log(`   Cost $${t.cost} → Sell $${t.sellPrice}`);

  const { data: existing } = await supabase
    .from('parts')
    .select('id, stripe_product_id')
    .eq('sku', t.sku)
    .maybeSingle();

  let stripeProductId = existing?.stripe_product_id;
  if (!stripeProductId) {
    const product = await stripe.products.create({
      name: t.name,
      description:
        `${t.name}. Fits Bobcat T770. Free shipping, 2-year warranty.`.slice(0, 500),
      metadata: { sku: t.sku, brand: 'Bobcat', track_size: t.size },
    });
    stripeProductId = product.id;
    console.log(`✅ Stripe Product: ${stripeProductId}`);
  }

  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(t.sellPrice * 100),
    currency: 'usd',
    metadata: { sku: t.sku },
  });
  console.log(`✅ Stripe Price: ${stripePrice.id}`);

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: t.name,
    slug: t.slug,
    sku: t.sku,
    brand: 'Bobcat',
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    description: `${t.intro}\n\n${SHARED_COPY}`,
    price: t.sellPrice,
    price_cents: Math.round(t.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: true,
    is_fast_moving: true,
    compatible_models: ['T770'],
    image_url: null,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: {
      cost_wholesale: t.cost,
      vendor_pn: t.vendorPn,
      vendor_supply_chain: 'tvh',
      track_size: t.size,
      tread_pattern: t.treadPattern,
      serial_prefixes: SERIAL_PREFIXES,
      warranty_months: 24,
      free_freight: true,
      source: 'tvh_rubber_tracks_v1',
    },
    updated_at: new Date().toISOString(),
  };

  const { data: upserted, error } = await supabase
    .from('parts')
    .upsert(row, { onConflict: 'sku' })
    .select('id, slug')
    .single();

  if (error) throw new Error(`${t.sku}: ${error.message}`);

  const margin = ((t.sellPrice - t.cost) / t.sellPrice) * 100;
  console.log(`✅ Supabase: ${upserted.id}`);
  console.log(`   Margin: ${margin.toFixed(1)}%`);
  console.log(`   Live: https://www.flatearthequipment.com/parts/${upserted.slug}`);
}

async function main() {
  if (TRACKS.length === 0) {
    console.error(
      'No T770 SKUs configured. Add rows to TRACKS after vendor lookup (costs + serial breaks).'
    );
    process.exit(1);
  }
  if (SERIAL_PREFIXES.length === 0) {
    console.warn('⚠️  SERIAL_PREFIXES is empty — fitment copy will be generic until you verify all breaks.');
  }
  for (const t of TRACKS) {
    await addTrack(t);
  }
  console.log('\n✅ All Bobcat T770 rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
