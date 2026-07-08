/**
 * Add Case TV370 rubber tracks — Supabase + Stripe.
 *
 * Vendor lookup (2026-07-08): TV370 returns two SKUs with no serial breaks:
 *   TSA/SY450X86X55C — 450×86×55 C (same PN as Bobcat T770)
 *   TSA/CS47598152 — 450×86×55 block (Case OEM cross-reference 47598152)
 *
 * TR340 unavailable at vendor — skip.
 *
 * Run: npx tsx scripts/add-case-tv370-rubber-tracks.ts
 *
 * Pricing (single track, 2026-07-08):
 *   450x86x55 C     — cost $1,275 → sell $1,449 (same as T770)
 *   450x86x55 Block — cost $795.22 → sell $999
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

const VERIFIED_MODELS = ['TV370'];

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
    sku: 'RT-TV370-450X86X55-C',
    slug: 'case-tv370-rubber-track-450x86x55',
    name: 'Case TV370 Rubber Track 450x86x55 C Pattern',
    size: '450x86x55',
    treadPattern: 'C pattern',
    cost: 1275,
    sellPrice: 1449,
    vendorPn: 'TSA/SY450X86X55C',
    intro:
      'Replacement rubber track for Case TV370 compact track loaders — 450mm wide, 86mm pitch, 55 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
  },
  {
    sku: 'RT-TV370-450X86X55-B',
    slug: 'case-tv370-rubber-track-450x86x55-block',
    name: 'Case TV370 Rubber Track 450x86x55 Block Tread',
    size: '450x86x55',
    treadPattern: 'Block',
    cost: 795.22,
    sellPrice: 999,
    vendorPn: 'TSA/CS47598152',
    oemPn: '47598152',
    intro:
      'Replacement rubber track for Case TV370 compact track loaders — 450mm wide, 86mm pitch, 55 links. The staggered block tread runs smoother on hard surfaces and pavement.',
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
      description: `${t.name}. Fits Case TV370. Free shipping, 2-year warranty.`.slice(0, 500),
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

  const fitmentBlock = `Verified for Case TV370 per vendor fitment catalog. Confirm track size on your machine before ordering — 450×86×55 is the standard TV370 width, not the 320×86×50 used on TR270/TR310. Find your serial plate with our Case serial number lookup.`;

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: t.name,
    slug: t.slug,
    sku: t.sku,
    brand: 'Case',
    ...(t.oemPn ? { oem_reference: t.oemPn } : {}),
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
      ...(t.oemPn ? { oem_pn: t.oemPn } : {}),
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
  console.log('\n✅ All Case TV370 rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
