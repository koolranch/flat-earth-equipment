/**
 * Add Bobcat T590 rubber tracks — Supabase + Stripe.
 *
 * T590 uses the same 320x86x49 / 400x86x49 track family as the T190 (49 links),
 * not the T650 320x86x52 size. Vendor lookup on A3NR (2026-07-07) returned the
 * same C-pattern part numbers as T190. Vendor lookup on six T590 serial breaks
 * (2026-07-07) returned the same four part numbers on every break: A3NR, A3NS,
 * ALJU, B378, B3Z7, B3ZA. A3NU-prefix T590s in Bobcat year-cut data not yet
 * checked in TVH.
 *
 * Pricing (single track, 2026-07-07):
 *   320x86x49 C  — cost $800   → sell $999
 *   400x86x49 C  — cost $618   → sell $949
 *   320x86x49 ZZ — cost $800   → sell $1,049
 *   400x86x49 ZZ — cost $900   → sell $1,149
 *
 * Run: npx tsx scripts/add-bobcat-t590-rubber-tracks.ts
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

/** Vendor-verified 2026-07-07 — identical 4-PN set on each break. */
const VERIFIED_PREFIXES = ['A3NR', 'A3NS', 'ALJU', 'B378', 'B3Z7', 'B3ZA'];

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
    sku: 'RT-T590-320X86X49-C',
    slug: 'bobcat-t590-rubber-track-320x86x49',
    name: 'Bobcat T590 Rubber Track 320x86x49 C Pattern',
    size: '320x86x49',
    treadPattern: 'C pattern',
    cost: 800,
    sellPrice: 999,
    vendorPn: 'TSA/SY320X86X49C',
    fitmentNote: `Verified fitment for Bobcat T590 serial prefixes ${VERIFIED_PREFIXES.join(', ')}. All six vendor serial breaks return this same track part number.`,
    intro:
      'Replacement rubber track for the Bobcat T590 compact track loader in the narrow 320mm width — 320mm wide, 86mm pitch, 49 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
  },
  {
    sku: 'RT-T590-400X86X49-C',
    slug: 'bobcat-t590-rubber-track-400x86x49',
    name: 'Bobcat T590 Rubber Track 400x86x49 C Pattern',
    size: '400x86x49',
    treadPattern: 'C pattern',
    cost: 618.06,
    sellPrice: 949,
    vendorPn: 'TSA/SY400X86X49C',
    fitmentNote: `Verified for Bobcat T590 serial prefixes ${VERIFIED_PREFIXES.join(', ')} running the 400mm-wide track option. All six vendor serial breaks return this same part number — measure your current track width before ordering.`,
    intro:
      'Replacement rubber track for Bobcat T590 compact track loaders running the 400mm-wide track option — 400mm wide, 86mm pitch, 49 links. The C-lug tread pattern delivers dependable traction in dirt, gravel, and mixed conditions.',
  },
  {
    sku: 'RT-T590-320X86X49-Z',
    slug: 'bobcat-t590-rubber-track-320x86x49-zigzag',
    name: 'Bobcat T590 Rubber Track 320x86x49 Zig-Zag Pattern',
    size: '320x86x49',
    treadPattern: 'Zig-zag',
    cost: 800,
    sellPrice: 1049,
    vendorPn: 'TSA/SY320X86X49Z',
    fitmentNote: `Verified fitment for Bobcat T590 serial prefixes ${VERIFIED_PREFIXES.join(', ')}. All six vendor serial breaks return this zig-zag tread part number.`,
    intro:
      'Replacement rubber track for the Bobcat T590 compact track loader in the narrow 320mm width — 320mm wide, 86mm pitch, 49 links. The zig-zag tread pattern offers aggressive multi-directional grip for soft ground and muddy conditions.',
  },
  {
    sku: 'RT-T590-400X86X49-Z',
    slug: 'bobcat-t590-rubber-track-400x86x49-zigzag',
    name: 'Bobcat T590 Rubber Track 400x86x49 Zig-Zag Pattern',
    size: '400x86x49',
    treadPattern: 'Zig-zag',
    cost: 900,
    sellPrice: 1149,
    vendorPn: 'TSA/SY84945',
    fitmentNote: `Verified for Bobcat T590 serial prefixes ${VERIFIED_PREFIXES.join(', ')} running the 400mm-wide track option. All six vendor serial breaks return this zig-zag tread part number — measure your current track width before ordering.`,
    intro:
      'Replacement rubber track for Bobcat T590 compact track loaders running the 400mm-wide track option — 400mm wide, 86mm pitch, 49 links. The zig-zag tread pattern delivers aggressive traction in soft or muddy terrain.',
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
        `${t.name}. Fits Bobcat T590. Free shipping, 2-year warranty.`.slice(0, 500),
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

  const fitmentBlock = `${t.fitmentNote} Not sure which prefix your machine is? Find your serial plate with our Bobcat serial number lookup and match the first four characters.`;

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: t.name,
    slug: t.slug,
    sku: t.sku,
    brand: 'Bobcat',
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    description: `${t.intro}\n\n${fitmentBlock}\n\n${SHARED_TAIL}`,
    price: t.sellPrice,
    price_cents: Math.round(t.sellPrice * 100),
    sales_type: 'direct',
    is_in_stock: true,
    is_fast_moving: true,
    compatible_models: ['T590'],
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
  console.log('\n✅ All Bobcat T590 rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
