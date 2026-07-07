/**
 * Add Caterpillar 289D rubber track — Supabase + Stripe.
 *
 * Vendor lookup on 289D TAW (2026-07-07) returned a single straight-bar SKU:
 * TSA/CT454-6097 (450mm wide, 86mm pitch, 56 links). CT prefix = Caterpillar OEM
 * cross-reference 454-6097.
 *
 * Run: npx tsx scripts/add-caterpillar-289d-rubber-tracks.ts
 *
 * Pricing (single track, 2026-07-07): cost $1,750 → sell $2,149
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

/** Vendor-verified on 289D TAW equipment filter, 2026-07-07. */
const VERIFIED_PREFIXES = ['TAW'];

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
  oemPn: string;
  intro: string;
};

const TRACKS: TrackSku[] = [
  {
    sku: 'RT-289D-450X86X56-SB',
    slug: 'caterpillar-289d-rubber-track-450x86x56',
    name: 'Caterpillar 289D Rubber Track 450x86x56 Straight Bar',
    size: '450x86x56',
    treadPattern: 'Straight bar',
    cost: 1750,
    sellPrice: 2149,
    vendorPn: 'TSA/CT454-6097',
    oemPn: '454-6097',
    intro:
      'Replacement rubber track for Caterpillar 289D compact track loaders — 450mm wide, 86mm pitch, 56 links. The straight-bar tread pattern delivers strong forward traction for loading, grading, and general CTL work.',
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
        `${t.name}. Fits Caterpillar 289D. Free shipping, 2-year warranty.`.slice(0, 500),
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

  const fitmentBlock = `Verified for Caterpillar 289D serial prefix ${VERIFIED_PREFIXES.join(', ')}. Additional 289D serial prefixes may apply — confirm your prefix on the serial plate before ordering. Not sure where to find it? Use our Caterpillar serial number lookup and match the first four characters. OEM cross-reference: ${t.oemPn}.`;

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: t.name,
    slug: t.slug,
    sku: t.sku,
    brand: 'Caterpillar',
    oem_reference: t.oemPn,
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    description: `${t.intro}\n\n${fitmentBlock}\n\n${SHARED_TAIL}`,
    price: t.sellPrice,
    price_cents: Math.round(t.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: true,
    is_fast_moving: true,
    compatible_models: ['289D'],
    image_url: null,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: {
      cost_wholesale: t.cost,
      vendor_pn: t.vendorPn,
      oem_pn: t.oemPn,
      vendor_supply_chain: 'tvh',
      track_size: t.size,
      tread_pattern: t.treadPattern,
      serial_prefixes: VERIFIED_PREFIXES,
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
  console.log('\n✅ Caterpillar 289D rubber track added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
