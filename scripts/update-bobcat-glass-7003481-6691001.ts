/**
 * Reprice two Bobcat cab-glass SKUs. Keep existing slugs.
 *
 * 7003481: cost $171.70 | Mag $236.95 → $225 | Ground $31
 * 6691001: cost $133.79 | Mag $195.45 → $186 | Ground $25
 * Old $50 / $47 stickers were junk comps — archive those Stripe prices.
 *
 * Run: npx tsx scripts/update-bobcat-glass-7003481-6691001.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { calculateSellPrice } from '../lib/pricing/calculateSellPrice';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type GlassUpdate = {
  sku: string;
  cost: number;
  compPrice: number;
  compUrl: string;
  freightCents: number;
  weightLbs: number;
  localImage: string;
  storagePath: string;
  name: string;
  description: string;
};

const UPDATES: GlassUpdate[] = [
  {
    sku: 'bobcat-7003481-left-sliding-window',
    cost: 171.7,
    compPrice: 236.95,
    compUrl: 'https://www.magnasourceinc.com/itemdetail/BC7003481',
    freightCents: 3100,
    weightLbs: 10.27,
    localImage: path.resolve(
      process.cwd(),
      'public/images/parts/glass/bobcat-7003481-left-sliding-window.jpg'
    ),
    storagePath: 'bobcat-7003481-left-sliding-window.jpg',
    name: 'Bobcat 7003481 Left Sliding Window',
    description: [
      'Aftermarket green-tint tempered left sliding window for Bobcat equipment. Replaces OEM part number 7003481.',
      '5 mm thick, 575 mm max width, 775 mm height, no holes. Rectangular sliding pane with a black edge and handle slot — not the fixed rear side glass. Fits 751, 753, 763, 773, S130, S175, S185, S220, S250, S300, T190, T250, T300.',
      'Eligible Bobcat aftermarket parts carry a 2-year warranty. In stock.',
    ].join('\n\n'),
  },
  {
    sku: 'bobcat-6691001-left-rear-side-window',
    cost: 133.79,
    compPrice: 195.45,
    compUrl: 'https://www.magnasourceinc.com/itemdetail/BC6691001',
    freightCents: 2500,
    weightLbs: 15.43,
    localImage: path.resolve(
      process.cwd(),
      'public/images/parts/glass/bobcat-6691001-left-rear-side-window.jpg'
    ),
    storagePath: 'bobcat-6691001-left-rear-side-window.jpg',
    name: 'Bobcat 6691001 Left Rear Side Window',
    description: [
      'Aftermarket green-tint tempered left rear side window for Bobcat equipment. Replaces OEM part number 6691001.',
      '5 mm thick, 646 mm max width, 809 mm height, no holes. Irregular pane with a cut corner — not the rectangular sliding window. Fits 963, S100, S130, S175, S185, S300, T110, T190.',
      'Eligible Bobcat aftermarket parts carry a 2-year warranty. In stock.',
    ].join('\n\n'),
  },
];

async function updateOne(row: GlassUpdate) {
  const priced = calculateSellPrice({
    cost: row.cost,
    compPrice: row.compPrice,
    category: 'assembly',
  });
  const sell = priced.sellPrice;
  console.log(
    `${row.sku}: cost $${row.cost} | Mag $${row.compPrice} → $${sell} (${priced.method}, ${(priced.marginPct * 100).toFixed(1)}%)`
  );

  const { data: existing, error: fetchErr } = await supabase
    .from('parts')
    .select('id, sku, slug, stripe_product_id, stripe_price_id, metadata')
    .eq('sku', row.sku)
    .maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!existing) throw new Error(`SKU ${row.sku} not found`);

  const buf = readFileSync(row.localImage);
  const { error: upErr } = await supabase.storage
    .from('products')
    .upload(row.storagePath, buf, { contentType: 'image/jpeg', upsert: true });
  if (upErr) throw new Error(upErr.message);
  const { data: urlData } = supabase.storage.from('products').getPublicUrl(row.storagePath);
  const imageUrl = urlData.publicUrl;

  const stripeProductId = existing.stripe_product_id as string;
  if (!stripeProductId) throw new Error(`Missing stripe_product_id on ${row.sku}`);

  await stripe.products.update(stripeProductId, {
    name: row.name,
    images: [imageUrl],
    description: row.description.slice(0, 500),
  });

  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(sell * 100),
    currency: 'usd',
    metadata: {
      sku: row.sku,
      previous_price_id: String(existing.stripe_price_id ?? ''),
      reason: 'reprice_under_mag_from_junk_comp',
    },
  });
  console.log(`  Stripe ${stripePrice.id}`);

  if (existing.stripe_price_id && existing.stripe_price_id !== stripePrice.id) {
    await stripe.prices.update(existing.stripe_price_id, { active: false });
    console.log(`  Archived ${existing.stripe_price_id}`);
  }

  const prevMeta =
    existing.metadata && typeof existing.metadata === 'object'
      ? (existing.metadata as Record<string, unknown>)
      : {};

  const { error: updErr } = await supabase
    .from('parts')
    .update({
      name: row.name,
      description: row.description,
      price: sell,
      price_cents: Math.round(sell * 100),
      sales_type: 'direct',
      is_in_stock: true,
      image_url: imageUrl,
      weight_lbs: row.weightLbs,
      stripe_price_id: stripePrice.id,
      metadata: {
        ...prevMeta,
        aftermarket: true,
        vendor_supply_chain: 'tvh',
        cost_wholesale: row.cost,
        freight_cents: row.freightCents,
        free_freight: false,
        weight_lbs: row.weightLbs,
        provisional_pricing: false,
        competitor_prices: [
          {
            source: 'magnasource',
            price: row.compPrice,
            url: row.compUrl,
            fetched_at: new Date().toISOString(),
          },
        ],
        last_comp_pricing: {
          at: new Date().toISOString(),
          method: priced.method,
          notes: priced.notes,
          margin_pct: Math.round(priced.marginPct * 1000) / 10,
        },
        source: 'mag_comp_2026-09-17',
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);

  if (updErr) throw new Error(updErr.message);
  console.log(`  Live https://www.flatearthequipment.com/parts/${existing.slug}\n`);
}

async function main() {
  for (const row of UPDATES) {
    await updateOne(row);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
