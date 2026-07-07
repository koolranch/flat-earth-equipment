/**
 * Add Bobcat MT85 rubber tracks — Supabase + Stripe.
 *
 * MT85 uses the mini-CTL 72mm-pitch track family (180x72x45 / 250x72x45) — not
 * the 86mm-pitch sizes on T550/T590/T650. Vendor lookup on B3TR (2026-07-07)
 * returned two C-pattern options only. Mini tracks miss the vendor free-freight
 * minimum — we absorb $41/pair (~$20.50/track) in sell price and keep the
 * free_freight checkout flag so tracks stay consistent with the category promise.
 *
 * Pricing (single track, 2026-07-07, freight absorbed):
 *   180x72x45 C — cost $250  → sell $379 (landed ~$270.50/track at qty 2)
 *   250x72x45 C — cost $315  → sell $459 (landed ~$335.50/track at qty 2)
 *
 * Run: npx tsx scripts/add-bobcat-mt85-rubber-tracks.ts
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

const VERIFIED_PREFIXES = ['B3TR'];

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
  fitmentNote: string;
};

const TRACKS: TrackSku[] = [
  {
    sku: 'RT-MT85-180X72X45-C',
    slug: 'bobcat-mt85-rubber-track-180x72x45',
    name: 'Bobcat MT85 Rubber Track 180x72x45 C Pattern',
    size: '180x72x45',
    treadPattern: 'C pattern',
    cost: 250,
    sellPrice: 379,
    vendorPn: 'TSA/SY180X72X45C',
    fitmentNote: `Verified for Bobcat MT85 serial prefix ${VERIFIED_PREFIXES.join(', ')} in the narrow 180mm configuration.`,
    intro:
      'Replacement rubber track for Bobcat MT85 mini track loaders in the narrow 180mm width — 180mm wide, 72mm pitch, 45 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
  },
  {
    sku: 'RT-MT85-250X72X45-C',
    slug: 'bobcat-mt85-rubber-track-250x72x45',
    name: 'Bobcat MT85 Rubber Track 250x72x45 C Pattern',
    size: '250x72x45',
    treadPattern: 'C pattern',
    cost: 315,
    sellPrice: 459,
    vendorPn: 'TSA/SY250X72X45C',
    fitmentNote: `Verified for Bobcat MT85 serial prefix ${VERIFIED_PREFIXES.join(', ')} in the 250mm-wide configuration. Measure your current track width before ordering.`,
    intro:
      'Replacement rubber track for Bobcat MT85 mini track loaders in the 250mm-wide configuration — 250mm wide, 72mm pitch, 45 links. The C-lug tread pattern delivers dependable traction in dirt, gravel, and mixed conditions.',
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
        `${t.name}. Fits Bobcat MT85. Free shipping, 2-year warranty.`.slice(0, 500),
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
    compatible_models: ['MT85'],
    image_url: null,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: {
      cost_wholesale: t.cost,
      vendor_pn: t.vendorPn,
      vendor_supply_chain: 'tvh',
      track_size: t.size,
      tread_pattern: t.treadPattern,
      serial_prefixes: VERIFIED_PREFIXES,
      warranty_months: 24,
      free_freight: true,
      vendor_freight_absorbed_per_track: 20.5,
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
  console.log('\n✅ All Bobcat MT85 rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
