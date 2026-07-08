/**
 * Add Kubota SVL65-2 rubber tracks — Supabase + Stripe.
 *
 * Vendor lookup (2026-07-08): SVL65-2 returns three SKUs with no serial breaks:
 *   TSA/SY320X86X52C — 320×86×52 C (same PN as SVL75 narrow / T650 narrow)
 *   TSA/SY380X86X52SVL65-2 — 380×86×52 block (same PN as SVL75 wide)
 *   TSA/SY400X86CNX52/323E — 400×86×52 C (same PN as Takeuchi TL8R2 wide)
 *
 * Run: npx tsx scripts/add-kubota-svl65-2-rubber-tracks.ts
 *
 * Pricing (single track, 2026-07-08):
 *   320x86x52 C  — cost $840  → sell $1,049
 *   380x86x52 Bl — cost $840  → sell $1,049
 *   400x86x52 C  — cost $950  → sell $1,179
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

const VERIFIED_MODELS = ['SVL65-2'];

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
    sku: 'RT-SVL65-320X86X52-C',
    slug: 'kubota-svl65-2-rubber-track-320x86x52',
    name: 'Kubota SVL65-2 Rubber Track 320x86x52 C Pattern',
    size: '320x86x52',
    treadPattern: 'C pattern',
    cost: 840,
    sellPrice: 1049,
    vendorPn: 'TSA/SY320X86X52C',
    fitmentNote:
      'Verified for Kubota SVL65-2 compact track loaders per vendor fitment catalog. Same 320×86×52 C-pattern track as SVL75 narrow — measure width on your machine before ordering.',
    intro:
      'Replacement rubber track for Kubota SVL65-2 compact track loaders in the narrow 320mm width — 320mm wide, 86mm pitch, 52 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
  },
  {
    sku: 'RT-SVL65-380X86X52-B',
    slug: 'kubota-svl65-2-rubber-track-380x86x52-block',
    name: 'Kubota SVL65-2 Rubber Track 380x86x52 Block Tread',
    size: '380x86x52',
    treadPattern: 'Block',
    cost: 840,
    sellPrice: 1049,
    vendorPn: 'TSA/SY380X86X52SVL65-2',
    fitmentNote:
      'Verified for Kubota SVL65-2 running the 380mm-wide track option. Vendor part number is scoped to SVL65-2 — confirm track width on the machine you are replacing.',
    intro:
      'Replacement rubber track for Kubota SVL65-2 compact track loaders in the 380mm-wide configuration — 380mm wide, 86mm pitch, 52 links. The block tread runs smoother on hard surfaces and pavement.',
  },
  {
    sku: 'RT-SVL65-400X86X52-C',
    slug: 'kubota-svl65-2-rubber-track-400x86x52',
    name: 'Kubota SVL65-2 Rubber Track 400x86x52 C Pattern',
    size: '400x86x52',
    treadPattern: 'C pattern',
    cost: 950,
    sellPrice: 1179,
    vendorPn: 'TSA/SY400X86CNX52/323E',
    fitmentNote:
      'Verified for Kubota SVL65-2 running the 400mm-wide track option. This width is exclusive to SVL65-2 in the vendor catalog — not interchangeable with SVL75 320mm or 380mm tracks.',
    intro:
      'Replacement rubber track for Kubota SVL65-2 compact track loaders in the 400mm-wide configuration — 400mm wide, 86mm pitch, 52 links. The C-lug tread pattern balances traction and ride quality for loading and general CTL work.',
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
        `${t.name}. Fits Kubota SVL65-2. Free shipping, 2-year warranty.`.slice(0, 500),
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

  const fitmentBlock = `${t.fitmentNote} Find your serial plate with our Kubota serial number lookup.`;

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
  console.log('\n✅ All Kubota SVL65-2 rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
