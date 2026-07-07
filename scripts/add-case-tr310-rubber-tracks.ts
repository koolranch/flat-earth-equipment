/**
 * Add Case TR310 rubber track — Supabase + Stripe.
 *
 * Vendor lookup on TR310 (2026-07-07) returned a single C-pattern SKU:
 * TSA/SY320X86X50C — same physical track as TR270 and Bobcat T66 narrow.
 *
 * Run: npx tsx scripts/add-case-tr310-rubber-tracks.ts
 *
 * Pricing: cost $820 → sell $999
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

async function main() {
  const track = {
    sku: 'RT-TR310-320X86X50-C',
    slug: 'case-tr310-rubber-track-320x86x50',
    name: 'Case TR310 Rubber Track 320x86x50 C Pattern',
    cost: 820,
    sellPrice: 999,
    vendorPn: 'TSA/SY320X86X50C',
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
        `${track.name}. Fits Case TR310. Free shipping, 2-year warranty.`.slice(0, 500),
      metadata: { sku: track.sku, brand: 'Case', track_size: '320x86x50' },
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
    'Replacement rubber track for Case TR310 compact track loaders — 320mm wide, 86mm pitch, 50 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.';

  const fitmentBlock =
    'Verified for Case TR310 per vendor fitment catalog. Confirm track size on your machine before ordering. Not sure where to find your serial plate? Use our Case serial number lookup.';

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: track.name,
    slug: track.slug,
    sku: track.sku,
    brand: 'Case',
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    description: `${intro}\n\n${fitmentBlock}\n\n${SHARED_TAIL}`,
    price: track.sellPrice,
    price_cents: Math.round(track.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: true,
    is_fast_moving: true,
    compatible_models: ['TR310'],
    image_url: null,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: {
      cost_wholesale: track.cost,
      vendor_pn: track.vendorPn,
      vendor_supply_chain: 'tvh',
      track_size: '320x86x50',
      tread_pattern: 'C pattern',
      verified_models: ['TR310'],
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
  console.log('\n✅ Case TR310 rubber track added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
