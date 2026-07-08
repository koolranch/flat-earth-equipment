/**
 * Add JCB 150T rubber track — Supabase + Stripe.
 *
 * Vendor lookup (2026-07-08): JCB 150T returns a single SKU:
 * JC333/L4732 — 320×86×48 block tread, JCB OEM cross-reference L4732.
 * No serial-prefix breaks in vendor catalog; model filter only.
 * Currently backordered at vendor.
 *
 * Run: npx tsx scripts/add-jcb-150t-rubber-tracks.ts
 *
 * Pricing: cost $1,651.57 → sell $2,049
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
  'This track is currently backordered at our supplier. Contact us to confirm availability and lead time before ordering.';

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
  compatibleModels: string[];
  fitmentNote: string;
  intro: string;
  cost: number;
  sellPrice: number;
  vendorPn: string;
  oemPn: string;
  backordered: boolean;
  availabilityNote?: string;
};

const TRACKS: TrackSku[] = [
  {
    sku: 'RT-JCB150T-320X86X48-B',
    slug: 'jcb-150t-rubber-track-320x86x48',
    name: 'JCB 150T Rubber Track 320x86x48 Block Tread',
    size: '320x86x48',
    treadPattern: 'Block',
    compatibleModels: ['150T'],
    fitmentNote:
      'Verified for JCB 150T compact track loaders per vendor fitment catalog — 320mm wide, 86mm pitch, 48 links (exclusive to 150T; not interchangeable with 190T 320×86×50). Confirm size on the track you are replacing before ordering. Find your serial plate with our JCB serial number lookup.',
    intro:
      'Replacement rubber track for JCB 150T compact track loaders — 320mm wide, 86mm pitch, 48 links. The staggered block tread pattern runs smoothly on hard surfaces and delivers dependable traction in dirt and mixed conditions.',
    cost: 1651.57,
    sellPrice: 2049,
    vendorPn: 'JC333/L4732',
    oemPn: 'L4732',
    backordered: true,
    availabilityNote: AVAILABILITY_NOTE,
  },
];

async function main() {
  for (const t of TRACKS) {
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
        description: `${t.name}. Free shipping, 2-year warranty.`.slice(0, 500),
        metadata: { sku: t.sku, brand: 'JCB', track_size: t.size },
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

    const row = {
      ...(existing?.id ? { id: existing.id } : {}),
      name: t.name,
      slug: t.slug,
      sku: t.sku,
      brand: 'JCB',
      oem_reference: t.oemPn,
      category: 'Rubber Tracks',
      category_slug: 'rubber-tracks',
      description: `${t.intro}\n\n${t.fitmentNote}${availabilityBlock}\n\n${SHARED_TAIL}`,
      price: t.sellPrice,
      price_cents: Math.round(t.sellPrice * 100),
      sales_type: 'direct',
      is_in_stock: !t.backordered,
      is_fast_moving: true,
      compatible_models: t.compatibleModels,
      image_url: null,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePrice.id,
      metadata: {
        cost_wholesale: t.cost,
        vendor_pn: t.vendorPn,
        oem_pn: t.oemPn,
        vendor_supply_chain: 'tvh',
        track_size: t.size,
        tread_pattern: t.treadPattern,
        verified_models: t.compatibleModels,
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

  console.log('\n✅ JCB 150T rubber track added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
