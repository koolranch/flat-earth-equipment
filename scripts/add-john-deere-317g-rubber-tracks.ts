/**
 * Add John Deere 317G rubber tracks — Supabase + Stripe.
 *
 * Vendor lookup (2026-07-08): 317G returns four SKUs with no serial breaks:
 *   TSA/SY320X86X50C — 320×86×50 C (same PN as T66 / TR270 / JCB 190T)
 *   TSA/SY320X86X50Z — 320×86×50 zig-zag
 *   TSA/SY400X86X50C — 400×86×50 C (same PN as T66 wide)
 *   TSA/SY84940 — 400×86×50 zig-zag (same PN as T66 wide ZZ)
 *
 * Run: npx tsx scripts/add-john-deere-317g-rubber-tracks.ts
 *
 * Pricing (single track, shared PNs with Bobcat T66):
 *   320x86x50 C  — cost $820  → sell $999
 *   320x86x50 ZZ — cost $820  → sell $1,019
 *   400x86x50 C  — cost $910  → sell $1,149
 *   400x86x50 ZZ — cost $910  → sell $1,149
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

const VERIFIED_MODELS = ['317G'];

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
};

const TRACKS: TrackSku[] = [
  {
    sku: 'RT-317G-320X86X50-C',
    slug: 'john-deere-317g-rubber-track-320x86x50',
    name: 'John Deere 317G Rubber Track 320x86x50 C Pattern',
    size: '320x86x50',
    treadPattern: 'C pattern',
    cost: 820,
    sellPrice: 999,
    vendorPn: 'TSA/SY320X86X50C',
    intro:
      'Replacement rubber track for John Deere 317G compact track loaders in the narrow 320mm width — 320mm wide, 86mm pitch, 50 links. The C-lug tread pattern is the all-around choice for dirt, gravel, and mixed-surface work.',
  },
  {
    sku: 'RT-317G-320X86X50-Z',
    slug: 'john-deere-317g-rubber-track-320x86x50-zigzag',
    name: 'John Deere 317G Rubber Track 320x86x50 Zig-Zag Pattern',
    size: '320x86x50',
    treadPattern: 'Zig-zag',
    cost: 820,
    sellPrice: 1019,
    vendorPn: 'TSA/SY320X86X50Z',
    intro:
      'Replacement rubber track for John Deere 317G compact track loaders in the narrow 320mm width — 320mm wide, 86mm pitch, 50 links. The zig-zag tread pattern offers aggressive multi-directional grip for soft ground and muddy conditions.',
  },
  {
    sku: 'RT-317G-400X86X50-C',
    slug: 'john-deere-317g-rubber-track-400x86x50',
    name: 'John Deere 317G Rubber Track 400x86x50 C Pattern',
    size: '400x86x50',
    treadPattern: 'C pattern',
    cost: 910,
    sellPrice: 1149,
    vendorPn: 'TSA/SY400X86X50C',
    intro:
      'Replacement rubber track for John Deere 317G compact track loaders in the 400mm-wide configuration — 400mm wide, 86mm pitch, 50 links. The C-lug tread pattern balances traction and ride quality for loading and general CTL work.',
  },
  {
    sku: 'RT-317G-400X86X50-Z',
    slug: 'john-deere-317g-rubber-track-400x86x50-zigzag',
    name: 'John Deere 317G Rubber Track 400x86x50 Zig-Zag Pattern',
    size: '400x86x50',
    treadPattern: 'Zig-zag',
    cost: 910,
    sellPrice: 1149,
    vendorPn: 'TSA/SY84940',
    intro:
      'Replacement rubber track for John Deere 317G compact track loaders in the 400mm-wide configuration — 400mm wide, 86mm pitch, 50 links. The zig-zag tread pattern delivers strong grip in mud, snow, and soft terrain.',
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
      description: `${t.name}. Fits John Deere 317G. Free shipping, 2-year warranty.`.slice(
        0,
        500,
      ),
      metadata: { sku: t.sku, brand: 'John Deere', track_size: t.size },
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

  const fitmentBlock = `Verified for John Deere 317G per vendor fitment catalog. Uses 50-link tracks — not interchangeable with 325G 320×86×52 or 333G 450×86×58 sizing. Measure width, pitch, and link count on the track you are replacing before ordering.`;

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: t.name,
    slug: t.slug,
    sku: t.sku,
    brand: 'John Deere',
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
  console.log('\n✅ All John Deere 317G rubber tracks added.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
