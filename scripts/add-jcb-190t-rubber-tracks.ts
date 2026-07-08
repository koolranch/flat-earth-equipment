/**
 * Add JCB 190T and 190T ECO rubber tracks — Supabase + Stripe.
 *
 * Vendor lookup (2026-07-08): both JCB 190T and 190T ECO return a single SKU:
 * TSA/SY320X86X50C — same physical track as Bobcat T66 / Case TR270 / TR310.
 * No serial-prefix breaks in vendor catalog; model filter only.
 *
 * Run: npx tsx scripts/add-jcb-190t-rubber-tracks.ts
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
    sku: 'RT-JCB190T-320X86X50-C',
    slug: 'jcb-190t-rubber-track-320x86x50',
    name: 'JCB 190T Rubber Track 320x86x50 C Pattern',
    compatibleModels: ['190T'],
    fitmentNote:
      'Verified for JCB 190T compact track loaders per vendor fitment catalog. Confirm width, pitch, and link count on the track you are replacing before ordering. Find your serial plate with our JCB serial number lookup.',
    intro:
      'Replacement rubber track for JCB 190T compact track loaders — 320mm wide, 86mm pitch, 50 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
    cost: 820,
    sellPrice: 999,
    vendorPn: 'TSA/SY320X86X50C',
  },
  {
    sku: 'RT-JCB190T-ECO-320X86X50-C',
    slug: 'jcb-190t-eco-rubber-track-320x86x50',
    name: 'JCB 190T ECO Rubber Track 320x86x50 C Pattern',
    compatibleModels: ['190T ECO'],
    fitmentNote:
      'Verified for JCB 190T ECO compact track loaders per vendor fitment catalog. Same 320×86×50 C-pattern track as the standard 190T listing — confirm size on your machine before ordering.',
    intro:
      'Replacement rubber track for JCB 190T ECO compact track loaders — 320mm wide, 86mm pitch, 50 links. The C-lug tread pattern delivers dependable traction in dirt, gravel, and mixed conditions.',
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

  console.log('\n✅ JCB 190T rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
