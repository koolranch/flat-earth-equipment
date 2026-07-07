/**
 * Add Kubota SVL75 / SVL75-2 rubber tracks — Supabase + Stripe.
 *
 * Vendor lookup on SVL75 and SVL75-2 (2026-07-07) returned the same three part
 * numbers on both models. The narrow 320x86x52 C-pattern track (TSA/SY320X86X52C)
 * is the same physical SKU as the Bobcat T650 narrow listing. Vendor does not
 * catalog SVL75-3 — listings cover SVL75 and SVL75-2 only.
 *
 * Run: npx tsx scripts/add-kubota-svl75-rubber-tracks.ts
 *
 * Pricing (single track, 2026-07-07):
 *   320x86x52 C  — cost $840     → sell $1,049 (same PN as T650 narrow)
 *   380x86x52 Bl — cost $840     → sell $1,049
 *   320x86x52 ZZ — cost $1,181   → sell $1,449
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

/** Vendor-verified 2026-07-07 on SVL75 and SVL75-2 equipment filters. */
const VERIFIED_MODELS = ['SVL75', 'SVL75-2'];

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
    sku: 'RT-SVL75-320X86X52-C',
    slug: 'kubota-svl75-rubber-track-320x86x52',
    name: 'Kubota SVL75 Rubber Track 320x86x52 C Pattern',
    size: '320x86x52',
    treadPattern: 'C pattern',
    cost: 840,
    sellPrice: 1049,
    vendorPn: 'TSA/SY320X86X52C',
    fitmentNote: `Verified for Kubota SVL75 and SVL75-2 compact track loaders. Vendor returns this same part number on both model lookups.`,
    intro:
      'Replacement rubber track for Kubota SVL75 and SVL75-2 compact track loaders in the narrow 320mm width — 320mm wide, 86mm pitch, 52 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
  },
  {
    sku: 'RT-SVL75-380X86X52-B',
    slug: 'kubota-svl75-rubber-track-380x86x52-block',
    name: 'Kubota SVL75 Rubber Track 380x86x52 Block Tread',
    size: '380x86x52',
    treadPattern: 'Block',
    cost: 840,
    sellPrice: 1049,
    vendorPn: 'TSA/SY380X86X52SVL65-2',
    fitmentNote: `Verified for Kubota SVL75 and SVL75-2 running the 380mm-wide track option. Measure your current track width before ordering — not every SVL75 uses this size.`,
    intro:
      'Replacement rubber track for Kubota SVL75 and SVL75-2 compact track loaders in the 380mm-wide configuration — 380mm wide, 86mm pitch, 52 links. The block tread runs smoother on hard surfaces and pavement.',
  },
  {
    sku: 'RT-SVL75-320X86X52-Z',
    slug: 'kubota-svl75-rubber-track-320x86x52-zigzag',
    name: 'Kubota SVL75 Rubber Track 320x86x52 Zig-Zag Pattern',
    size: '320x86x52',
    treadPattern: 'Zig-zag',
    cost: 1181.23,
    sellPrice: 1449,
    vendorPn: 'TSA/SYB320X86X52Y6',
    fitmentNote: `Verified for Kubota SVL75 and SVL75-2 compact track loaders. Vendor returns this zig-zag tread part number on both model lookups.`,
    intro:
      'Replacement rubber track for Kubota SVL75 and SVL75-2 in the narrow 320mm width — 320mm wide, 86mm pitch, 52 links. The zig-zag tread pattern offers aggressive multi-directional grip for soft ground and muddy conditions.',
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
        `${t.name}. Fits Kubota SVL75 / SVL75-2. Free shipping, 2-year warranty.`.slice(0, 500),
      metadata: { sku: t.sku, brand: 'Kubota', track_size: t.size },
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

  const fitmentBlock = `${t.fitmentNote} Not sure which model or serial you have? Find your plate with our Kubota serial number lookup.`;

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: t.name,
    slug: t.slug,
    sku: t.sku,
    brand: 'Kubota',
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    description: `${t.intro}\n\n${fitmentBlock}\n\n${SHARED_TAIL}`,
    price: t.sellPrice,
    price_cents: Math.round(t.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: true,
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
  console.log('\n✅ All Kubota SVL75 rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
