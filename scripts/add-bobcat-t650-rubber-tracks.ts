/**
 * Add Bobcat T650 rubber tracks (3 SKUs) — Supabase + Stripe.
 *
 * First SKUs of the Rubber Tracks category rollout. Fitment verified against
 * all five T650 serial-prefix breaks (A3P0, A3P1, ALJG, B5FF, T1ML) via the
 * vendor lookup on 2026-07-03. Free vendor shipping (free_freight flag) and
 * 24-month warranty on every track. Intake data: data/tracks/rubber-track-intake.csv
 *
 * Pricing vs comps (single track, aftermarket, 2026-07-03):
 *   320x86x52 C  — cost $840  → sell $1,049 (comps $1,081–1,100)
 *   450x86x52 C  — cost $1,200 → sell $1,395 (comps $950–1,400; premium on free ship + warranty)
 *   450x84x53 Bl — cost $1,125 → sell $1,325 (block-tread comps ~$1,468/ea)
 *
 * Run: npx tsx scripts/add-bobcat-t650-rubber-tracks.ts
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

const SERIAL_PREFIXES = ['A3P0', 'A3P1', 'ALJG', 'B5FF', 'T1ML'];

const SHARED_COPY = [
  'Free shipping and a 2-year warranty on every rubber track — no freight surcharge at checkout.',

  'Verified fitment for all Bobcat T650 serial numbers, covering serial prefixes A3P0, A3P1, ALJG, B5FF, and T1ML. Not sure which prefix your machine is? Find your serial plate with our Bobcat serial number lookup and match the first four characters.',

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
    sku: 'RT-450X86X52-C',
    slug: 'bobcat-t650-rubber-track-450x86x52',
    name: 'Bobcat T650 Rubber Track 450x86x52 C Pattern',
    size: '450x86x52',
    treadPattern: 'C pattern',
    cost: 1200,
    sellPrice: 1395,
    vendorPn: 'TSA/SY450X86X52C',
    intro:
      'Replacement rubber track for the Bobcat T650 compact track loader in the standard 450mm width — 450mm wide, 86mm pitch, 52 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work, balancing traction, ride quality, and wear life.',
  },
  {
    sku: 'RT-450X84X53-B',
    slug: 'bobcat-t650-rubber-track-450x84x53-block',
    name: 'Bobcat T650 Rubber Track 450x84x53 Block Tread',
    size: '450x84x53',
    treadPattern: 'Block',
    cost: 1125,
    sellPrice: 1325,
    vendorPn: 'TSA/SY84849',
    intro:
      'Replacement rubber track for the Bobcat T650 compact track loader in the 84mm-pitch interchange configuration — 450mm wide, 84mm pitch, 53 links. The staggered block tread runs smoother on hard surfaces and pavement, making it a favorite for concrete crews and roadwork. Confirm pitch before ordering: this track interchanges with the factory 86mm-pitch undercarriage on the T650 but is not the same as the 450x86x52.',
  },
  {
    sku: 'RT-320X86X52-C',
    slug: 'bobcat-t650-rubber-track-320x86x52',
    name: 'Bobcat T650 Rubber Track 320x86x52 C Pattern',
    size: '320x86x52',
    treadPattern: 'C pattern',
    cost: 840,
    sellPrice: 1049,
    vendorPn: 'TSA/SY320X86X52C',
    intro:
      'Replacement rubber track for Bobcat T650 compact track loaders running the narrow 320mm track option — 320mm wide, 86mm pitch, 52 links. The C-lug tread pattern delivers dependable traction in dirt, gravel, and mixed conditions. Measure your current track width before ordering: most T650s run the 450mm-wide track; this 320mm track fits machines configured with the narrow undercarriage.',
  },
];

async function addTrack(t: TrackSku) {
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
        `${t.name}. Fits all Bobcat T650 serial numbers. Free shipping, 2-year warranty.`.slice(0, 500),
      metadata: {
        sku: t.sku,
        brand: 'Bobcat',
        track_size: t.size,
      },
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
    compatible_models: ['T650'],
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
  console.log(`   Margin: ${margin.toFixed(1)}% ($${(t.sellPrice - t.cost).toFixed(2)} gross)`);
  console.log(`   Live: https://www.flatearthequipment.com/parts/${upserted.slug}`);
}

async function main() {
  for (const t of TRACKS) {
    await addTrack(t);
  }
  console.log('\n✅ All Bobcat T650 rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
