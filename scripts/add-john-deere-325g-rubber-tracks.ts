/**
 * Add John Deere 325G rubber tracks — Supabase + Stripe.
 *
 * Vendor lookup on 325G (2026-07-07) returned three SKUs: narrow 320 C-pattern,
 * wide 400 multibar, and wide 400 block. Block (SY84914) shares a vendor PN with
 * Takeuchi TL8R2 — confirm cost is the same before publishing.
 *
 * Run: npx tsx scripts/add-john-deere-325g-rubber-tracks.ts
 *
 * Pricing (single track, 2026-07-07):
 *   320x86x52 C  — cost $840    → sell $1,049
 *   400x86x52 Mb — cost $921    → sell $1,149 (backordered, no vendor ETA)
 *   400x86x52 Bl — cost $930    → sell $1,149
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
  fitmentNote: string;
  backordered?: boolean;
  availabilityNote?: string;
};

const TRACKS: TrackSku[] = [
  {
    sku: 'RT-325G-320X86X52-C',
    slug: 'john-deere-325g-rubber-track-320x86x52',
    name: 'John Deere 325G Rubber Track 320x86x52 C Pattern',
    size: '320x86x52',
    treadPattern: 'C pattern',
    cost: 840,
    sellPrice: 1049,
    vendorPn: 'TSA/SY320X86X52C',
    fitmentNote:
      'Verified for John Deere 325G compact track loaders in the narrow 320mm configuration. Measure your current track width before ordering.',
    intro:
      'Replacement rubber track for John Deere 325G compact track loaders in the narrow 320mm width — 320mm wide, 86mm pitch, 52 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
  },
  {
    sku: 'RT-325G-400X86X52-M',
    slug: 'john-deere-325g-rubber-track-400x86x52-multibar',
    name: 'John Deere 325G Rubber Track 400x86x52 Multibar Tread',
    size: '400x86x52',
    treadPattern: 'Multibar',
    cost: 921.04,
    sellPrice: 1149,
    vendorPn: 'TSA/SYZC-B400X86X52-E5',
    backordered: true,
    availabilityNote:
      'Backordered — contact us to confirm availability before ordering. Vendor has no ETA at this time.',
    fitmentNote:
      'Verified for John Deere 325G running the 400mm-wide multibar track option. Measure width, pitch, and link count on the track you are replacing before ordering.',
    intro:
      'Replacement rubber track for John Deere 325G compact track loaders in the 400mm-wide multibar configuration — 400mm wide, 86mm pitch, 52 links. The multibar tread delivers strong traction for aggressive digging and slope work.',
  },
  {
    sku: 'RT-325G-400X86X52-B',
    slug: 'john-deere-325g-rubber-track-400x86x52-block',
    name: 'John Deere 325G Rubber Track 400x86x52 Block Tread',
    size: '400x86x52',
    treadPattern: 'Block',
    cost: 930,
    sellPrice: 1149,
    vendorPn: 'TSA/SY84914',
    fitmentNote:
      'Verified for John Deere 325G running the 400mm-wide block-tread option. Measure your current track width before ordering.',
    intro:
      'Replacement rubber track for John Deere 325G compact track loaders in the 400mm-wide block configuration — 400mm wide, 86mm pitch, 52 links. The block tread runs smoother on hard surfaces and pavement.',
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
        `${t.name}. Fits John Deere 325G. Free shipping, 2-year warranty.`.slice(0, 500),
      metadata: { sku: t.sku, brand: 'John Deere', track_size: t.size },
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

  const availabilityBlock = t.backordered && t.availabilityNote ? `\n\n${t.availabilityNote}` : '';
  const fitmentBlock = `${t.fitmentNote} Confirm track size on your machine before ordering.${availabilityBlock}`;

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: t.name,
    slug: t.slug,
    sku: t.sku,
    brand: 'John Deere',
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    description: `${t.intro}\n\n${fitmentBlock}\n\n${SHARED_TAIL}`,
    price: t.sellPrice,
    price_cents: Math.round(t.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: !t.backordered,
    is_fast_moving: true,
    compatible_models: ['325G'],
    image_url: null,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: {
      cost_wholesale: t.cost,
      vendor_pn: t.vendorPn,
      vendor_supply_chain: 'tvh',
      track_size: t.size,
      tread_pattern: t.treadPattern,
      verified_models: ['325G'],
      warranty_months: 24,
      free_freight: true,
      source: 'tvh_rubber_tracks_v1',
      ...(t.backordered
        ? {
            backordered: true,
            availability_note: t.availabilityNote,
          }
        : {}),
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
  console.log('\n✅ All John Deere 325G rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
