/**
 * Add Takeuchi TL8 and TL8R-2 rubber tracks — Supabase + Stripe.
 *
 * Vendor catalogs TL8 and TL8R-2 separately with different part numbers — do NOT
 * merge into one listing. TL8 offers 320 C + 400 block; TL8R-2 offers 400 C +
 * 400 block only (no narrow 320 in vendor lookup, 2026-07-07).
 *
 * Pricing (single track, 2026-07-07):
 *   TL8 320x86x52 C  — cost $701   → sell $899
 *   TL8 400x86x52 Bl — cost $930   → sell $1,149
 *   TL8R2 400x86x52 C — cost $950  → sell $1,179
 *   TL8R2 400x86x52 Bl — cost $930 → sell $1,149
 *
 * Run: npx tsx scripts/add-takeuchi-tl8-rubber-tracks.ts
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
  brand: string;
  compatibleModels: string[];
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
    sku: 'RT-TL8-320X86X52-C',
    slug: 'takeuchi-tl8-rubber-track-320x86x52',
    name: 'Takeuchi TL8 Rubber Track 320x86x52 C Pattern',
    brand: 'Takeuchi',
    compatibleModels: ['TL8'],
    size: '320x86x52',
    treadPattern: 'C pattern',
    cost: 701.25,
    sellPrice: 899,
    vendorPn: 'TSA/SY320X86X52',
    fitmentNote:
      'Verified for Takeuchi TL8 compact track loaders in the narrow 320mm configuration. TL8R-2 uses different track part numbers — confirm your model before ordering.',
    intro:
      'Replacement rubber track for Takeuchi TL8 compact track loaders in the narrow 320mm width — 320mm wide, 86mm pitch, 52 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
  },
  {
    sku: 'RT-TL8-400X86X52-B',
    slug: 'takeuchi-tl8-rubber-track-400x86x52-block',
    name: 'Takeuchi TL8 Rubber Track 400x86x52 Block Tread',
    brand: 'Takeuchi',
    compatibleModels: ['TL8'],
    size: '400x86x52',
    treadPattern: 'Block',
    cost: 930,
    sellPrice: 1149,
    vendorPn: 'TSA/SY84825',
    fitmentNote:
      'Verified for Takeuchi TL8 running the 400mm-wide track option. Measure your current track width before ordering.',
    intro:
      'Replacement rubber track for Takeuchi TL8 compact track loaders in the 400mm-wide configuration — 400mm wide, 86mm pitch, 52 links. The block tread runs smoother on hard surfaces and pavement.',
  },
  {
    sku: 'RT-TL8R2-400X86X52-C',
    slug: 'takeuchi-tl8r2-rubber-track-400x86x52',
    name: 'Takeuchi TL8R2 Rubber Track 400x86x52 C Pattern',
    brand: 'Takeuchi',
    compatibleModels: ['TL8R2'],
    size: '400x86x52',
    treadPattern: 'C pattern',
    cost: 950,
    sellPrice: 1179,
    vendorPn: 'TSA/SY400X86CNX52/323E',
    fitmentNote:
      'Verified for Takeuchi TL8R2 compact track loaders. TL8 and TL8R2 use different vendor track part numbers — confirm your model on the serial plate before ordering.',
    intro:
      'Replacement rubber track for Takeuchi TL8R2 compact track loaders — 400mm wide, 86mm pitch, 52 links. The C-lug tread pattern delivers dependable traction in dirt, gravel, and mixed conditions.',
  },
  {
    sku: 'RT-TL8R2-400X86X52-B',
    slug: 'takeuchi-tl8r2-rubber-track-400x86x52-block',
    name: 'Takeuchi TL8R2 Rubber Track 400x86x52 Block Tread',
    brand: 'Takeuchi',
    compatibleModels: ['TL8R2'],
    size: '400x86x52',
    treadPattern: 'Block',
    cost: 930,
    sellPrice: 1149,
    vendorPn: 'TSA/SY84914',
    fitmentNote:
      'Verified for Takeuchi TL8R2 running the block-tread 400mm-wide configuration. TL8 and TL8R2 use different vendor track part numbers.',
    intro:
      'Replacement rubber track for Takeuchi TL8R2 compact track loaders — 400mm wide, 86mm pitch, 52 links. The block tread runs smoother on hard surfaces and pavement.',
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
      description: `${t.name}. Free shipping, 2-year warranty.`.slice(0, 500),
      metadata: { sku: t.sku, brand: t.brand, track_size: t.size },
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

  const fitmentBlock = `${t.fitmentNote} Not sure which model you have? Find your serial plate with our Takeuchi serial number lookup.`;

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: t.name,
    slug: t.slug,
    sku: t.sku,
    brand: t.brand,
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    description: `${t.intro}\n\n${fitmentBlock}\n\n${SHARED_TAIL}`,
    price: t.sellPrice,
    price_cents: Math.round(t.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: true,
    is_fast_moving: true,
    compatible_models: t.compatibleModels,
    image_url: null,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: {
      cost_wholesale: t.cost,
      vendor_pn: t.vendorPn,
      vendor_supply_chain: 'tvh',
      track_size: t.size,
      tread_pattern: t.treadPattern,
      verified_models: t.compatibleModels,
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
  console.log('\n✅ All Takeuchi TL8 / TL8R2 rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
