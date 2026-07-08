/**
 * Add John Deere 331G rubber tracks — Supabase + Stripe.
 *
 * Vendor lookup (2026-07-08): 331G returns three SKUs with no serial breaks:
 *   TSA/SY450X86X58C — 450×86×58 C (same PN as 333G / Kubota SVL95)
 *   TSA/SY450X86X58Z — 450×86×58 zig-zag
 *   TSA/WA1000397806 — 450×86×56 multibar (56 links — not interchangeable with 58-link options)
 *
 * Run: npx tsx scripts/add-john-deere-331g-rubber-tracks.ts
 *
 * Pricing (single track, 2026-07-08):
 *   450x86x58 C  — cost $1,350    → sell $1,649
 *   450x86x58 ZZ — cost $1,350    → sell $1,669
 *   450x86x56 Mb — cost $1,122.89 → sell $1,399 (backordered, no vendor ETA)
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

const AVAILABILITY_NOTE =
  'This track is currently backordered at our supplier with no estimated restock date. Contact us to confirm availability and lead time before ordering.';

const VERIFIED_MODELS = ['331G'];

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
  backordered?: boolean;
  availabilityNote?: string;
};

const TRACKS: TrackSku[] = [
  {
    sku: 'RT-331G-450X86X58-C',
    slug: 'john-deere-331g-rubber-track-450x86x58',
    name: 'John Deere 331G Rubber Track 450x86x58 C Pattern',
    size: '450x86x58',
    treadPattern: 'C pattern',
    cost: 1350,
    sellPrice: 1649,
    vendorPn: 'TSA/SY450X86X58C',
    intro:
      'Replacement rubber track for John Deere 331G compact track loaders — 450mm wide, 86mm pitch, 58 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work, balancing traction, ride quality, and wear life.',
  },
  {
    sku: 'RT-331G-450X86X58-Z',
    slug: 'john-deere-331g-rubber-track-450x86x58-zigzag',
    name: 'John Deere 331G Rubber Track 450x86x58 Zig-Zag Pattern',
    size: '450x86x58',
    treadPattern: 'Zig-zag',
    cost: 1350,
    sellPrice: 1669,
    vendorPn: 'TSA/SY450X86X58Z',
    intro:
      'Replacement rubber track for John Deere 331G compact track loaders — 450mm wide, 86mm pitch, 58 links. The zig-zag tread pattern offers aggressive multi-directional grip for soft ground, mud, and winter conditions.',
  },
  {
    sku: 'RT-331G-450X86X56-M',
    slug: 'john-deere-331g-rubber-track-450x86x56-multibar',
    name: 'John Deere 331G Rubber Track 450x86x56 Multibar Tread',
    size: '450x86x56',
    treadPattern: 'Multibar',
    cost: 1122.89,
    sellPrice: 1399,
    vendorPn: 'TSA/WA1000397806',
    intro:
      'Replacement rubber track for John Deere 331G compact track loaders in the multibar configuration — 450mm wide, 86mm pitch, 56 links. The multibar tread delivers strong forward traction for loading, grading, and general CTL work.',
    backordered: true,
    availabilityNote: AVAILABILITY_NOTE,
  },
];

async function addTrack(t: TrackSku) {
  console.log(`\n🚀 ${t.name}`);
  console.log(`   Cost $${t.cost} → Sell $${t.sellPrice}${t.backordered ? ' (BACKORDERED)' : ''}`);

  const { data: existing } = await supabase
    .from('parts')
    .select('id, stripe_product_id')
    .eq('sku', t.sku)
    .maybeSingle();

  let stripeProductId = existing?.stripe_product_id;
  if (!stripeProductId) {
    const product = await stripe.products.create({
      name: t.name,
      description: `${t.name}. Fits John Deere 331G. Free shipping, 2-year warranty.`.slice(
        0,
        500,
      ),
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

  const availabilityBlock =
    t.backordered && t.availabilityNote ? `\n\n${t.availabilityNote}` : '';
  const fitmentBlock = `Verified for John Deere 331G per vendor fitment catalog. Confirm width, pitch, and link count on the track you are replacing — the 450×86×56 multibar option uses 56 links and is not interchangeable with the 58-link C or zig-zag tracks.${availabilityBlock}`;

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
    compatible_models: VERIFIED_MODELS,
    image_url: null,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: {
      cost_wholesale: t.cost,
      vendor_pn: t.vendorPn,
      vendor_supply_chain: 'tvh',
      track_size: t.size,
      tread_pattern: t.treadPattern,
      verified_models: VERIFIED_MODELS,
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
  console.log('\n✅ All John Deere 331G rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
