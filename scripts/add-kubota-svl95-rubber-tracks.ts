/**
 * Add Kubota SVL95-2S / SVL95-2SC rubber track — Supabase + Stripe.
 *
 * Vendor lookup on SVL95-2S and SVL95-2SC (2026-07-07) returned the same single
 * SKU: TSA/SY450X86X58C — same physical track as John Deere 333G. Vendor does not
 * catalog SVL75-3.
 *
 * Run: npx tsx scripts/add-kubota-svl95-rubber-tracks.ts
 *
 * Pricing (single track, shared PN with 333G): cost $1,350 → sell $1,649
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

const VERIFIED_MODELS = ['SVL95-2S', 'SVL95-2SC'];

const SHARED_TAIL = [
  'Free shipping and a 2-year warranty on every rubber track — no freight surcharge at checkout.',
  'Most operators replace tracks in pairs: running a new track opposite a worn one causes uneven loading that shortens the life of both. Order quantity 2 for a full set.',
].join('\n\n');

async function main() {
  const track = {
    sku: 'RT-SVL95-450X86X58-C',
    slug: 'kubota-svl95-rubber-track-450x86x58',
    name: 'Kubota SVL95 Rubber Track 450x86x58 C Pattern',
    size: '450x86x58',
    treadPattern: 'C pattern',
    cost: 1350,
    sellPrice: 1649,
    vendorPn: 'TSA/SY450X86X58C',
  };

  console.log(`\n🚀 ${track.name}`);
  console.log(`   Cost $${track.cost} → Sell $${track.sellPrice}`);

  const { data: existing } = await supabase
    .from('parts')
    .select('id, stripe_product_id')
    .eq('sku', track.sku)
    .maybeSingle();

  let stripeProductId = existing?.stripe_product_id;
  if (!stripeProductId) {
    const product = await stripe.products.create({
      name: track.name,
      description:
        `${track.name}. Fits Kubota SVL95-2S / SVL95-2SC. Free shipping, 2-year warranty.`.slice(
          0,
          500,
        ),
      metadata: { sku: track.sku, brand: 'Kubota', track_size: track.size },
    });
    stripeProductId = product.id;
    console.log(`✅ Stripe Product: ${stripeProductId}`);
  }

  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(track.sellPrice * 100),
    currency: 'usd',
    metadata: { sku: track.sku },
  });
  console.log(`✅ Stripe Price: ${stripePrice.id}`);

  const intro =
    'Replacement rubber track for Kubota SVL95-2S and SVL95-2SC compact track loaders — 450mm wide, 86mm pitch, 58 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work, balancing traction, ride quality, and wear life.';

  const fitmentBlock = `Verified for Kubota SVL95-2S and SVL95-2SC per vendor fitment catalog. Not sure which model you have? Find your plate with our Kubota serial number lookup.`;

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: track.name,
    slug: track.slug,
    sku: track.sku,
    brand: 'Kubota',
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    description: `${intro}\n\n${fitmentBlock}\n\n${SHARED_TAIL}`,
    price: track.sellPrice,
    price_cents: Math.round(track.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: true,
    is_fast_moving: true,
    compatible_models: VERIFIED_MODELS,
    image_url: null,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: {
      cost_wholesale: track.cost,
      vendor_pn: track.vendorPn,
      vendor_supply_chain: 'tvh',
      track_size: track.size,
      tread_pattern: track.treadPattern,
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

  if (error) throw new Error(error.message);

  const margin = ((track.sellPrice - track.cost) / track.sellPrice) * 100;
  console.log(`✅ Supabase: ${upserted.id}`);
  console.log(`   Margin: ${margin.toFixed(1)}%`);
  console.log(`   Live: https://www.flatearthequipment.com/parts/${upserted.slug}`);
  console.log('\n✅ Kubota SVL95 rubber track added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
