/**
 * Add Case TR270 rubber tracks — Supabase + Stripe.
 *
 * Vendor lookup on TR270 (2026-07-07) returned two 320x86x50 options: standard
 * C-pattern (SY320X86X50C, same PN as Bobcat T66) and Bridgestone (SY84909).
 *
 * Pricing (single track, 2026-07-07):
 *   320x86x50 C           — cost $820 → sell $999
 *   320x86x50 Bridgestone — cost $820 → sell $1,049
 *
 * Run: npx tsx scripts/add-case-tr270-rubber-tracks.ts
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
};

const TRACKS: TrackSku[] = [
  {
    sku: 'RT-TR270-320X86X50-C',
    slug: 'case-tr270-rubber-track-320x86x50',
    name: 'Case TR270 Rubber Track 320x86x50 C Pattern',
    size: '320x86x50',
    treadPattern: 'C pattern',
    cost: 820,
    sellPrice: 999,
    vendorPn: 'TSA/SY320X86X50C',
    intro:
      'Replacement rubber track for Case TR270 compact track loaders — 320mm wide, 86mm pitch, 50 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
  },
  {
    sku: 'RT-TR270-320X86X50-BS',
    slug: 'case-tr270-rubber-track-320x86x50-bridgestone',
    name: 'Case TR270 Rubber Track 320x86x50 Bridgestone',
    size: '320x86x50',
    treadPattern: 'Bridgestone',
    cost: 820,
    sellPrice: 1049,
    vendorPn: 'TSA/SY84909',
    intro:
      'Replacement Bridgestone rubber track for Case TR270 compact track loaders — 320mm wide, 86mm pitch, 50 links. Premium tread compound for longer wear life in demanding applications.',
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
        `${t.name}. Fits Case TR270. Free shipping, 2-year warranty.`.slice(0, 500),
      metadata: { sku: t.sku, brand: 'Case', track_size: t.size },
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

  const fitmentBlock =
    'Verified for Case TR270 per vendor fitment catalog. Confirm track size on your machine before ordering — measure width, pitch, and link count on the track you are replacing. Not sure where to find your serial plate? Use our Case serial number lookup.';

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: t.name,
    slug: t.slug,
    sku: t.sku,
    brand: 'Case',
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    description: `${t.intro}\n\n${fitmentBlock}\n\n${SHARED_TAIL}`,
    price: t.sellPrice,
    price_cents: Math.round(t.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: true,
    is_fast_moving: true,
    compatible_models: ['TR270'],
    image_url: null,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: {
      cost_wholesale: t.cost,
      vendor_pn: t.vendorPn,
      vendor_supply_chain: 'tvh',
      track_size: t.size,
      tread_pattern: t.treadPattern,
      verified_models: ['TR270'],
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
  console.log('\n✅ All Case TR270 rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
