/**
 * Class III 1.75x5x48 full-taper fork (FEE-F3-023).
 * Portal each $434.34, must buy in pairs. $565/fork, qty 2 ($1,130 pair).
 * $395 LTL once per order. Helmar $375 each stays on file.
 *
 * Run: npx tsx scripts/pricing/apply-fee-f3-023-fork.ts
 */

import path from 'path';
import { readFileSync } from 'fs';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SKU = 'FEE-F3-023';
const SELL = 565;
const PORTAL_EACH = 434.34;
const HELMAR_EACH = 375;
const FREIGHT_CENTS = 39500;
const STORAGE_PATH = 'fee-f3-023-class-iii-fork-1-3-4x5x48-ftp.jpg';
const LOCAL_IMAGE = path.resolve(
  process.cwd(),
  'public/images/parts/forks/fee-f3-023-class-iii-fork-1-3-4x5x48-ftp.jpg'
);
const DESCRIPTION =
  'Aftermarket Class III forklift fork, 1.75 in thick by 5 in wide by 48 in long, full taper. Sold as a pair. Freight is $395 per shipment and covers both forks on one pallet. Match the class, thickness, width, length, and taper on the fork you are replacing.';

async function main() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: part, error } = await supabase
    .from('parts')
    .select('id,slug,price,price_cents,stripe_product_id,stripe_price_id,metadata')
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
      reason: 'per_fork_portal_cost_tax_stripe_pair_only',
    },
  });
  if (part.stripe_price_id) {
    await stripe.prices.update(part.stripe_price_id, { active: false });
  }
  await stripe.products.update(part.stripe_product_id, {
    name: 'Class III Fork 1.75 x 5 x 48 Full Taper',
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
      name: 'Class III Fork 1.75 x 5 x 48 Full Taper',
      description: DESCRIPTION,
      brand: 'Flat Earth Equipment',
      price: SELL,
      price_cents: SELL * 100,
      stripe_price_id: newStripePrice.id,
      sales_type: 'direct',
      is_in_stock: true,
      image_url: imageUrl,
      metadata: {
        ...prior,
        cost_wholesale: PORTAL_EACH,
        freight_cents: FREIGHT_CENTS,
        qty_default: 2,
        pair_only: true,
        free_freight: false,
        provisional_pricing: false,
        pricing: {
          ...priorPricing,
          dealerCostPerFork: PORTAL_EACH,
          dealerCostPair: Math.round(PORTAL_EACH * 2 * 100) / 100,
          helmarCostPerFork: HELMAR_EACH,
          soldAs: 'Pair',
          pricingNote:
            'Per fork, sold only as a pair. Preferred buy is the vendor portal at $434.34 each. Helmar $375 each stays on file.',
        },
        specifications: {
          ...priorSpecs,
          class: 'Class III',
          finish: 'Full Taper',
          dimensions: '1 3/4X5X48',
          soldAs: 'Pair',
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
    `FEE-F3-023: $${part.price} → $${SELL}/fork | pair $${SELL * 2} | freight $395 once | ${newStripePrice.id}`
  );
  console.log(`Hero: ${imageUrl}`);
  console.log(`PDP: https://www.flatearthequipment.com/parts/${part.slug}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
