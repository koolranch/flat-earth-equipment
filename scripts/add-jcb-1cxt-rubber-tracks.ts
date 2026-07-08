/**
 * Add JCB 1CXT rubber track — Supabase + Stripe.
 *
 * Vendor lookup (2026-07-08): JCB 1CXT, 1CXT HF, 1CXT EC, and 1CXT HF EC each
 * return a single SKU: TSA/SY320X86X50C — same physical track as 190T / T66 /
 * TR270 / TR310. No serial-prefix breaks; model filter only.
 *
 * Run: npx tsx scripts/add-jcb-1cxt-rubber-tracks.ts
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

const COMPATIBLE_MODELS = ['1CXT', '1CXT HF', '1CXT EC', '1CXT HF EC'];

const SHARED_TAIL = [
  'Free shipping and a 2-year warranty on every rubber track — no freight surcharge at checkout.',
  'Most operators replace tracks in pairs: running a new track opposite a worn one causes uneven loading that shortens the life of both. Order quantity 2 for a full set.',
].join('\n\n');

type TrackSku = {
  sku: string;
  slug: string;
  name: string;
  compatibleModels: string[];
  fitmentNote: string;
  intro: string;
  cost: number;
  sellPrice: number;
  vendorPn: string;
};

const TRACKS: TrackSku[] = [
  {
    sku: 'RT-JCB1CXT-320X86X50-C',
    slug: 'jcb-1cxt-rubber-track-320x86x50',
    name: 'JCB 1CXT Rubber Track 320x86x50 C Pattern',
    compatibleModels: COMPATIBLE_MODELS,
    fitmentNote:
      'Verified for JCB 1CXT, 1CXT HF, 1CXT EC, and 1CXT HF EC per vendor fitment catalog. Same 320×86×50 C-pattern track as JCB 190T — not interchangeable with 150T (320×86×48). Confirm size on the track you are replacing before ordering. Find your serial plate with our JCB serial number lookup.',
    intro:
      'Replacement rubber track for JCB 1CXT compact track loaders — 320mm wide, 86mm pitch, 50 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work on this hybrid mini CTL.',
    cost: 820,
    sellPrice: 999,
    vendorPn: 'TSA/SY320X86X50C',
  },
];

async function main() {
  for (const t of TRACKS) {
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
        metadata: { sku: t.sku, brand: 'JCB', track_size: '320x86x50' },
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

    const row = {
      ...(existing?.id ? { id: existing.id } : {}),
      name: t.name,
      slug: t.slug,
      sku: t.sku,
      brand: 'JCB',
      category: 'Rubber Tracks',
      category_slug: 'rubber-tracks',
      description: `${t.intro}\n\n${t.fitmentNote}\n\n${SHARED_TAIL}`,
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
        track_size: '320x86x50',
        tread_pattern: 'C pattern',
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

  console.log('\n✅ JCB 1CXT rubber track added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
