/**
 * Add Bobcat T190 rubber tracks — Supabase + Stripe.
 *
 * T190 uses 320x86x49 (49 links) — NOT the T650 320x86x52.
 * Wide option is 400x86x49 on 8/10 serial breaks; 5277/5278 use 320x84x50 instead.
 *
 * Run: npx tsx scripts/add-bobcat-t190-rubber-tracks.ts
 *
 * Comp reference (single track, 2026-07-06): Advance ~$930; Monster T190 $849–$1,049;
 * SkidHeaven 400x86x49 ~$1,100+.
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

const ALL_PREFIXES = [
  '5193',
  '5194',
  '5270',
  '5277',
  '5278',
  '5279',
  '5316',
  '5317',
  'A3LN',
  'A3LP',
];

const WIDE_PREFIXES = [
  '5193',
  '5194',
  '5270',
  '5279',
  '5316',
  '5317',
  'A3LN',
  'A3LP',
];

const ALT_PITCH_PREFIXES = ['5277', '5278'];

const SHARED_TAIL = [
  'Free shipping and a 2-year warranty on every rubber track — no freight surcharge at checkout.',
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
  serialPrefixes: string[];
  fitmentNote: string;
};

const TRACKS: TrackSku[] = [
  {
    sku: 'RT-T190-320X86X49-C',
    slug: 'bobcat-t190-rubber-track-320x86x49',
    name: 'Bobcat T190 Rubber Track 320x86x49 C Pattern',
    size: '320x86x49',
    treadPattern: 'C pattern',
    cost: 800,
    sellPrice: 999,
    vendorPn: 'TSA/SY320X86X49C',
    serialPrefixes: ALL_PREFIXES,
    fitmentNote: `Verified fitment for all Bobcat T190 serial numbers, covering serial prefixes ${ALL_PREFIXES.join(', ')}.`,
    intro:
      'Replacement rubber track for the Bobcat T190 compact track loader in the narrow 320mm width — 320mm wide, 86mm pitch, 49 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
  },
  {
    sku: 'RT-T190-400X86X49-C',
    slug: 'bobcat-t190-rubber-track-400x86x49',
    name: 'Bobcat T190 Rubber Track 400x86x49 C Pattern',
    size: '400x86x49',
    treadPattern: 'C pattern',
    cost: 618.06,
    sellPrice: 949,
    vendorPn: 'TSA/SY400X86X49C',
    serialPrefixes: WIDE_PREFIXES,
    fitmentNote: `Fits Bobcat T190 serial prefixes ${WIDE_PREFIXES.join(', ')}. Machines with prefixes 5277 or 5278 use a different wide-track configuration — confirm your serial plate before ordering.`,
    intro:
      'Replacement rubber track for Bobcat T190 compact track loaders running the 400mm-wide track option — 400mm wide, 86mm pitch, 49 links. Measure your current track width before ordering; not every T190 uses this size.',
  },
  {
    sku: 'RT-T190-320X84X50-C',
    slug: 'bobcat-t190-rubber-track-320x84x50',
    name: 'Bobcat T190 Rubber Track 320x84x50 C Pattern',
    size: '320x84x50',
    treadPattern: 'C pattern',
    cost: 596.28,
    sellPrice: 749,
    vendorPn: 'TSA/SY6766330009',
    serialPrefixes: ALT_PITCH_PREFIXES,
    fitmentNote: `Fits Bobcat T190 serial prefixes ${ALT_PITCH_PREFIXES.join(' and ')} only. Confirm pitch on your current track — this 84mm-pitch size is not interchangeable with the standard 320x86x49.`,
    intro:
      'Replacement rubber track for Bobcat T190 compact track loaders in the 84mm-pitch interchange configuration — 320mm wide, 84mm pitch, 50 links. This alternate pitch applies to a subset of T190 serial numbers; verify your serial prefix before ordering.',
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
        `${t.name}. Fits Bobcat T190. Free shipping, 2-year warranty.`.slice(0, 500),
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

  const fitmentBlock = `${t.fitmentNote} Not sure which prefix your machine is? Find your serial plate with our Bobcat serial number lookup and match the first four characters.`;

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: t.name,
    slug: t.slug,
    sku: t.sku,
    brand: 'Bobcat',
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    description: `${t.intro}\n\n${fitmentBlock}\n\n${SHARED_TAIL}`,
    price: t.sellPrice,
    price_cents: Math.round(t.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: true,
    is_fast_moving: true,
    compatible_models: ['T190'],
    image_url: null,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: {
      cost_wholesale: t.cost,
      vendor_pn: t.vendorPn,
      vendor_supply_chain: 'tvh',
      track_size: t.size,
      tread_pattern: t.treadPattern,
      serial_prefixes: t.serialPrefixes,
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
  for (const t of TRACKS) {
    await addTrack(t);
  }
  console.log('\n✅ All Bobcat T190 rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
