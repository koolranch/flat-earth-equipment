/**
 * Add Bobcat T66 rubber tracks — Supabase + Stripe.
 *
 * T66 uses 320x86x50 / 400x86x50 (50 links — not the T650 52-link family).
 * Vendor lookup on B51V and B4SB (2026-07-07) returned the same six part numbers
 * on both serial breaks.
 *
 * Pricing (single track, 2026-07-07):
 *   320x86x50 C  — cost $820    → sell $999
 *   400x86x50 C  — cost $910    → sell $1,149
 *   320x86x50 Z  — cost $820    → sell $1,019
 *   400x86x50 Z  — cost $910    → sell $1,149
 *   320x86x50 SB — cost $900    → sell $1,149 (OEM 7394912)
 *   400x86x50 SB — cost $886    → sell $1,129 (OEM 7408151, backordered)
 *
 * Run: npx tsx scripts/add-bobcat-t66-rubber-tracks.ts
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

/** Vendor-verified 2026-07-07 — identical 6-PN set on each break. */
const VERIFIED_PREFIXES = ['B51V', 'B4SB'];

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
  fitmentNote: string;
  backordered?: boolean;
  availabilityNote?: string;
};

const PREFIX_NOTE = `Verified fitment for Bobcat T66 serial prefixes ${VERIFIED_PREFIXES.join(', ')}. All vendor serial breaks checked so far return this same part number.`;

const TRACKS: TrackSku[] = [
  {
    sku: 'RT-T66-320X86X50-C',
    slug: 'bobcat-t66-rubber-track-320x86x50',
    name: 'Bobcat T66 Rubber Track 320x86x50 C Pattern',
    size: '320x86x50',
    treadPattern: 'C pattern',
    cost: 820,
    sellPrice: 999,
    vendorPn: 'TSA/SY320X86X50C',
    fitmentNote: `${PREFIX_NOTE} Narrow 320mm configuration.`,
    intro:
      'Replacement rubber track for Bobcat T66 compact track loaders in the narrow 320mm width — 320mm wide, 86mm pitch, 50 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
  },
  {
    sku: 'RT-T66-320X86X50-Z',
    slug: 'bobcat-t66-rubber-track-320x86x50-zigzag',
    name: 'Bobcat T66 Rubber Track 320x86x50 Zig-Zag Pattern',
    size: '320x86x50',
    treadPattern: 'Zig-zag',
    cost: 820,
    sellPrice: 1019,
    vendorPn: 'TSA/SY320X86X50Z',
    fitmentNote: PREFIX_NOTE,
    intro:
      'Replacement rubber track for Bobcat T66 in the narrow 320mm width — 320mm wide, 86mm pitch, 50 links. The zig-zag tread pattern offers aggressive multi-directional grip for soft ground and muddy conditions.',
  },
  {
    sku: 'RT-T66-400X86X50-C',
    slug: 'bobcat-t66-rubber-track-400x86x50',
    name: 'Bobcat T66 Rubber Track 400x86x50 C Pattern',
    size: '400x86x50',
    treadPattern: 'C pattern',
    cost: 910,
    sellPrice: 1149,
    vendorPn: 'TSA/SY400X86X50C',
    fitmentNote: `${PREFIX_NOTE} Measure your current track width before ordering.`,
    intro:
      'Replacement rubber track for Bobcat T66 compact track loaders running the 400mm-wide track option — 400mm wide, 86mm pitch, 50 links. The C-lug tread pattern delivers dependable traction in dirt, gravel, and mixed conditions.',
  },
  {
    sku: 'RT-T66-400X86X50-Z',
    slug: 'bobcat-t66-rubber-track-400x86x50-zigzag',
    name: 'Bobcat T66 Rubber Track 400x86x50 Zig-Zag Pattern',
    size: '400x86x50',
    treadPattern: 'Zig-zag',
    cost: 910,
    sellPrice: 1149,
    vendorPn: 'TSA/SY84940',
    fitmentNote: `${PREFIX_NOTE} Measure your current track width before ordering.`,
    intro:
      'Replacement rubber track for Bobcat T66 in the 400mm-wide configuration — 400mm wide, 86mm pitch, 50 links. The zig-zag tread pattern delivers aggressive traction in soft or muddy terrain.',
  },
  {
    sku: 'RT-T66-320X86X50-SB',
    slug: 'bobcat-t66-rubber-track-320x86x50-straight-bar',
    name: 'Bobcat T66 Rubber Track 320x86x50 Straight Bar',
    size: '320x86x50',
    treadPattern: 'Straight bar',
    cost: 900,
    sellPrice: 1149,
    vendorPn: 'TSA/BC7394912',
    oemPn: '7394912',
    fitmentNote: PREFIX_NOTE,
    intro:
      'Replacement rubber track for Bobcat T66 in the narrow 320mm width — 320mm wide, 86mm pitch, 50 links. The straight-bar tread pattern delivers strong forward traction for loading and grading work.',
  },
  {
    sku: 'RT-T66-400X86X50-SB',
    slug: 'bobcat-t66-rubber-track-400x86x50-straight-bar',
    name: 'Bobcat T66 Rubber Track 400x86x50 Straight Bar',
    size: '400x86x50',
    treadPattern: 'Straight bar',
    cost: 885.61,
    sellPrice: 1129,
    vendorPn: 'TSA/BC7408151',
    oemPn: '7408151',
    backordered: true,
    availabilityNote:
      'Backordered — contact us to confirm availability before ordering. Vendor has no ETA at this time.',
    fitmentNote: `${PREFIX_NOTE} Measure your current track width before ordering.`,
    intro:
      'Replacement rubber track for Bobcat T66 in the 400mm-wide configuration — 400mm wide, 86mm pitch, 50 links. The straight-bar tread pattern delivers strong forward traction for loading and grading work.',
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
        `${t.name}. Fits Bobcat T66. Free shipping, 2-year warranty.`.slice(0, 500),
      metadata: { sku: t.sku, brand: 'Bobcat', track_size: t.size },
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
  const fitmentBlock = `${t.fitmentNote}${availabilityBlock} Not sure which prefix your machine is? Find your serial plate with our Bobcat serial number lookup and match the first four characters.`;

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: t.name,
    slug: t.slug,
    sku: t.sku,
    brand: 'Bobcat',
    ...(t.oemPn ? { oem_reference: t.oemPn } : {}),
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    description: `${t.intro}\n\n${fitmentBlock}\n\n${SHARED_TAIL}`,
    price: t.sellPrice,
    price_cents: Math.round(t.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: !t.backordered,
    is_fast_moving: true,
    compatible_models: ['T66'],
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
      serial_prefixes: VERIFIED_PREFIXES,
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

async function main() {
  for (const t of TRACKS) {
    await addTrack(t);
  }
  console.log('\n✅ All Bobcat T66 rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
