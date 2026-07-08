/**
 * Add Caterpillar 279D rubber tracks — Supabase + Stripe.
 *
 * Vendor lookup (2026-07-08): 279D serial breaks TP5 and GTL each return the same
 * four SKUs:
 *   TSA/SY450X86X56C — 450×86×56 C pattern
 *   TSA/CT454-6097 — 450×86×56 straight bar (same PN as 289D TAW)
 *   TSA/JDT317183 — 450×86×56 block
 *   TSA/SY84988 — 400×86×56 C pattern (narrow)
 *
 * Run: npx tsx scripts/add-caterpillar-279d-rubber-tracks.ts
 *
 * Pricing (single track, 2026-07-08):
 *   450x86x56 C          — cost $1,300 → sell $1,649
 *   450x86x56 Straight   — cost $1,750 → sell $2,149 (same as 289D)
 *   450x86x56 Block      — cost $1,500 → sell $1,849
 *   400x86x56 C (narrow) — cost $1,000 → sell $1,249
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

/** Vendor-verified 2026-07-08 on 279D TP5 and GTL serial breaks — identical SKU set. */
const VERIFIED_PREFIXES = ['TP5', 'GTL'];

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
  oemPn?: string;
  intro: string;
};

const TRACKS: TrackSku[] = [
  {
    sku: 'RT-279D-450X86X56-C',
    slug: 'caterpillar-279d-rubber-track-450x86x56',
    name: 'Caterpillar 279D Rubber Track 450x86x56 C Pattern',
    size: '450x86x56',
    treadPattern: 'C pattern',
    cost: 1300,
    sellPrice: 1649,
    vendorPn: 'TSA/SY450X86X56C',
    intro:
      'Replacement rubber track for Caterpillar 279D compact track loaders — 450mm wide, 86mm pitch, 56 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
  },
  {
    sku: 'RT-279D-450X86X56-SB',
    slug: 'caterpillar-279d-rubber-track-450x86x56-straight-bar',
    name: 'Caterpillar 279D Rubber Track 450x86x56 Straight Bar',
    size: '450x86x56',
    treadPattern: 'Straight bar',
    cost: 1750,
    sellPrice: 2149,
    vendorPn: 'TSA/CT454-6097',
    oemPn: '454-6097',
    intro:
      'Replacement rubber track for Caterpillar 279D compact track loaders — 450mm wide, 86mm pitch, 56 links. The straight-bar tread pattern delivers strong forward traction for loading, grading, and general CTL work.',
  },
  {
    sku: 'RT-279D-450X86X56-B',
    slug: 'caterpillar-279d-rubber-track-450x86x56-block',
    name: 'Caterpillar 279D Rubber Track 450x86x56 Block Tread',
    size: '450x86x56',
    treadPattern: 'Block',
    cost: 1500,
    sellPrice: 1849,
    vendorPn: 'TSA/JDT317183',
    intro:
      'Replacement rubber track for Caterpillar 279D compact track loaders — 450mm wide, 86mm pitch, 56 links. The block tread runs smoother on hard surfaces and pavement.',
  },
  {
    sku: 'RT-279D-400X86X56-C',
    slug: 'caterpillar-279d-rubber-track-400x86x56',
    name: 'Caterpillar 279D Rubber Track 400x86x56 C Pattern',
    size: '400x86x56',
    treadPattern: 'C pattern',
    cost: 1000,
    sellPrice: 1249,
    vendorPn: 'TSA/SY84988',
    intro:
      'Replacement rubber track for Caterpillar 279D compact track loaders in the narrow 400mm width — 400mm wide, 86mm pitch, 56 links. The C-lug tread pattern balances traction and ride quality when your machine runs the narrower track option.',
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
        `${t.name}. Fits Caterpillar 279D. Free shipping, 2-year warranty.`.slice(0, 500),
      metadata: { sku: t.sku, brand: 'Caterpillar', track_size: t.size },
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

  const fitmentBlock = `Verified for Caterpillar 279D serial prefixes ${VERIFIED_PREFIXES.join(' and ')} per vendor fitment catalog. Match the first characters of your serial number — find your plate with our Caterpillar serial number lookup. Measure track width before ordering if you are unsure between the 400mm and 450mm options.`;

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: t.name,
    slug: t.slug,
    sku: t.sku,
    brand: 'Caterpillar',
    ...(t.oemPn ? { oem_reference: t.oemPn } : {}),
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    description: `${t.intro}\n\n${fitmentBlock}\n\n${SHARED_TAIL}`,
    price: t.sellPrice,
    price_cents: Math.round(t.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: true,
    is_fast_moving: true,
    compatible_models: ['279D'],
    image_url: null,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: {
      cost_wholesale: t.cost,
      vendor_pn: t.vendorPn,
      ...(t.oemPn ? { oem_pn: t.oemPn } : {}),
      vendor_supply_chain: 'tvh',
      track_size: t.size,
      tread_pattern: t.treadPattern,
      serial_prefixes: VERIFIED_PREFIXES,
      verified_models: ['279D'],
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
  console.log('\n✅ All Caterpillar 279D rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
