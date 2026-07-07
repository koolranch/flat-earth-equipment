/**
 * Add Caterpillar 259D / 259D3 rubber tracks — Supabase + Stripe.
 *
 * 259D and 259D3 share core PNs. Vendor shows one 259D serial break (FTL) and
 * four 259D3 breaks (TE9, MC9, TLS, CW9) — all verified for the two core SKUs.
 *
 * Run: npx tsx scripts/add-caterpillar-259d-rubber-tracks.ts
 *
 * Comp reference (single track, 2026-07-06): Monster 259D $949–$1,169;
 * Prowler 320x86x53 ~$1,016; Prowler 400x86x53 ~$1,261.
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

/** 259D has a single vendor serial break; 259D3 has four. */
const PREFIX_259D = ['FTL'];
const PREFIX_259D3 = ['TE9', 'MC9', 'TLS', 'CW9'];
const VERIFIED_PREFIXES = [...PREFIX_259D, ...PREFIX_259D3];

const FITMENT_NOTE = `Verified fitment for Caterpillar 259D serial prefix ${PREFIX_259D.join(', ')} and 259D3 serial prefixes ${PREFIX_259D3.join(', ')}. Measure your current track width before ordering — machines run either the 320mm narrow or 400mm wide track.`;

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
    sku: 'RT-CAT-259D-400X86X53-C',
    slug: 'caterpillar-259d-rubber-track-400x86x53',
    name: 'Caterpillar 259D / 259D3 Rubber Track 400x86x53 C Pattern',
    size: '400x86x53',
    treadPattern: 'C pattern',
    cost: 975,
    sellPrice: 1099,
    vendorPn: 'TSA/SY84826',
    intro:
      'Replacement rubber track for Caterpillar 259D and 259D3 compact track loaders in the 400mm-wide configuration — 400mm wide, 86mm pitch, 53 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
    fitmentNote: FITMENT_NOTE,
  },
  {
    sku: 'RT-CAT-259D-320X86X53-BLOCK',
    slug: 'caterpillar-259d-rubber-track-320x86x53',
    name: 'Caterpillar 259D / 259D3 Rubber Track 320x86x53 Block',
    size: '320x86x53',
    treadPattern: 'Block',
    cost: 860,
    sellPrice: 1049,
    vendorPn: 'TSA/CT357-0232',
    intro:
      'Replacement rubber track for Caterpillar 259D and 259D3 compact track loaders in the narrow 320mm configuration — 320mm wide, 86mm pitch, 53 links, block tread pattern. Confirm width on your current track before ordering.',
    fitmentNote: FITMENT_NOTE,
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
        `${t.name}. Fits Caterpillar 259D and 259D3. Free shipping, 2-year warranty.`.slice(
          0,
          500
        ),
      metadata: { sku: t.sku, brand: 'Caterpillar', track_size: t.size },
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

  const fitmentBlock = `${t.fitmentNote} Not sure which prefix your machine is? Find your serial plate with our Caterpillar serial number lookup and match the first four characters.`;

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: t.name,
    slug: t.slug,
    sku: t.sku,
    brand: 'Caterpillar',
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    description: `${t.intro}\n\n${fitmentBlock}\n\n${SHARED_TAIL}`,
    price: t.sellPrice,
    price_cents: Math.round(t.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: true,
    is_fast_moving: true,
    compatible_models: ['259D', '259D3'],
    image_url: null,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: {
      cost_wholesale: t.cost,
      vendor_pn: t.vendorPn,
      vendor_supply_chain: 'tvh',
      track_size: t.size,
      tread_pattern: t.treadPattern,
      serial_prefixes: VERIFIED_PREFIXES,
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
  console.log('\n✅ All Caterpillar 259D / 259D3 rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
