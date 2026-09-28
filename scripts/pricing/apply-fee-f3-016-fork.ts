/**
 * Class III 2x6x48 fork (FEE-F3-016): sell per fork from vendor-portal cost.
 * $575 each, qty defaults to 2 ($1,150 pair). $395 LTL once per order.
 * Portal each is $441.66 (201 lb). Helmar $340 each stays on file, not the buy price.
 *
 * Run: npx tsx scripts/pricing/apply-fee-f3-016-fork.ts
 */

import path from 'path';
import { readFileSync } from 'fs';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SKU = 'FEE-F3-016';
const SELL = 575;
const PORTAL_EACH = 441.66;
const HELMAR_EACH = 340;
const FREIGHT_CENTS = 39500;
const WEIGHT_LBS = 201;
const STORAGE_PATH = 'fee-f3-016-class-iii-fork-2x6x48.jpg';
const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/forks/fee-f3-016-class-iii-fork-2x6x48.jpg'
);
const DESCRIPTION =
  'Aftermarket Class III forklift fork, 2 in thick by 6 in wide by 48 in long. Standard taper with a carriage hook, about 201 lb each. Sold per fork. Most operators replace both sides. Freight is $395 per shipment and covers a pair on one pallet. Match the class, thickness, width, and length on the fork you are replacing.';

async function main() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: part, error } = await supabase
    .from('parts')
    .select('id,slug,price,price_cents,stripe_product_id,stripe_price_id,metadata,brand')
    .eq('sku', SKU)
    .single();
  if (error || !part) throw new Error(error?.message ?? 'missing');
  if (!part.stripe_product_id) throw new Error('missing stripe_product_id');

  const buf = readFileSync(LOCAL_IMAGE);
  const { error: upErr } = await supabase.storage
    .from('products')
    .upload(STORAGE_PATH, buf, { contentType: 'image/jpeg', upsert: true });
  if (upErr) throw new Error(upErr.message);
  const { data: urlData } = supabase.storage.from('products').getPublicUrl(STORAGE_PATH);
  const imageUrl = urlData.publicUrl;

  const newStripePrice = await stripe.prices.create({
    product: part.stripe_product_id,
    unit_amount: SELL * 100,
    currency: 'usd',
    metadata: {
      sku: SKU,
      previous_price_cents: String(part.price_cents),
      reason: 'per_fork_portal_cost_tax_stripe',
    },
  });
  if (part.stripe_price_id) {
    await stripe.prices.update(part.stripe_price_id, { active: false });
  }
  await stripe.products.update(part.stripe_product_id, {
    name: 'Class III Fork 2 x 6 x 48',
    description: DESCRIPTION,
    images: [imageUrl],
  });

  const prior = (part.metadata ?? {}) as Record<string, unknown>;
  const priorPricing =
    prior.pricing && typeof prior.pricing === 'object'
      ? (prior.pricing as Record<string, unknown>)
      : {};
  const priorSpecs =
    prior.specifications && typeof prior.specifications === 'object'
      ? (prior.specifications as Record<string, unknown>)
      : {};
  const fetchedAt = new Date().toISOString();

  const { error: updErr } = await supabase
    .from('parts')
    .update({
      name: 'Class III Fork 2 x 6 x 48',
      description: DESCRIPTION,
      brand: 'Flat Earth Equipment',
      price: SELL,
      price_cents: SELL * 100,
      stripe_price_id: newStripePrice.id,
      sales_type: 'direct',
      is_in_stock: true,
      weight_lbs: WEIGHT_LBS,
      image_url: imageUrl,
      metadata: {
        ...prior,
        cost_wholesale: PORTAL_EACH,
        freight_cents: FREIGHT_CENTS,
        qty_default: 2,
        free_freight: false,
        provisional_pricing: false,
        pricing: {
          ...priorPricing,
          dealerCostPerFork: PORTAL_EACH,
          dealerCostPair: Math.round(PORTAL_EACH * 2 * 100) / 100,
          helmarCostPerFork: HELMAR_EACH,
          soldAs: 'Each',
          pricingNote:
            'Per fork. Preferred buy is the vendor portal at $441.66 each. Helmar $340 each stays on file.',
        },
        specifications: {
          ...priorSpecs,
          class: 'Class III',
          dimensions: '2X6X48',
          soldAs: 'Each',
          weight_lbs: WEIGHT_LBS,
        },
      },
      updated_at: fetchedAt,
    })
    .eq('id', part.id);
  if (updErr) throw new Error(updErr.message);

  const { error: trayErr } = await supabase.from('part_image_reviews').upsert(
    {
      sku: SKU,
      part_id: part.id,
      slug: part.slug,
      status: 'approved',
      filename: STORAGE_PATH,
      identity_ok: true,
      public_url: imageUrl,
      note: 'watermark cleaned — this SKU only',
      updated_at: fetchedAt,
    },
    { onConflict: 'sku' }
  );
  if (trayErr) console.warn(`tray upsert: ${trayErr.message}`);

  console.log(
    `FEE-F3-016: $${part.price} pair-as-unit → $${SELL}/fork | freight $395 once | ${newStripePrice.id}`
  );
  console.log(`Hero: ${imageUrl}`);
  console.log(`PDP: https://www.flatearthequipment.com/parts/${part.slug}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
