/**
 * JCB 333/C3422 48" fork: Mag street $282.28 vs our $629.
 * Cost $174.53. LTL (~113 lb) — charge $250 once per order (covers a pair).
 */

import path from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { calculateSellPrice } from '../../lib/pricing/calculateSellPrice';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });

const SKU = '333C3422';
const COST = 174.53;
const MAG = 282.28;
const FREIGHT_CENTS = 25000;
const DESCRIPTION =
  'Aftermarket 48" fork for JCB part number 333/C3422. Single forged tine with carriage hooks, sold per fork. Most operators replace both sides. Freight is $250 per shipment and covers a pair on one pallet. Match the part number and length on the fork you are replacing.';

async function main() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const pricing = calculateSellPrice({
    cost: COST,
    compPrice: MAG,
    category: 'assembly',
  });

  const { data: part, error } = await supabase
    .from('parts')
    .select('id,price,price_cents,stripe_product_id,stripe_price_id,metadata')
    .eq('sku', SKU)
    .single();
  if (error || !part) throw new Error(error?.message ?? 'missing');
  if (!part.stripe_product_id) throw new Error('missing stripe_product_id');

  const newStripePrice = await stripe.prices.create({
    product: part.stripe_product_id,
    unit_amount: Math.round(pricing.sellPrice * 100),
    currency: 'usd',
    metadata: {
      sku: SKU,
      previous_price_cents: String(part.price_cents),
      reason: 'mag_undercut_ltl_pair_freight',
    },
  });
  if (part.stripe_price_id) {
    await stripe.prices.update(part.stripe_price_id, { active: false });
  }
  await stripe.products.update(part.stripe_product_id, {
    description: DESCRIPTION,
  });

  const prior = (part.metadata ?? {}) as Record<string, unknown>;
  const { error: upErr } = await supabase
    .from('parts')
    .update({
      description: DESCRIPTION,
      price: pricing.sellPrice,
      price_cents: Math.round(pricing.sellPrice * 100),
      stripe_price_id: newStripePrice.id,
      sales_type: 'direct',
      is_in_stock: true,
      weight_lbs: 113,
      metadata: {
        ...prior,
        cost_wholesale: COST,
        freight_cents: FREIGHT_CENTS,
        qty_default: 2,
        free_freight: false,
        provisional_pricing: false,
        last_comp_pricing: {
          at: new Date().toISOString(),
          method: pricing.method,
          comp_discount: pricing.compDiscountUsed ?? 0.05,
          margin_pct: Math.round(pricing.marginPct * 1000) / 10,
          notes: [
            ...pricing.notes,
            `TVH net $${COST} · Mag $${MAG} · sell $${pricing.sellPrice} · LTL freight $250/pair (once per order)`,
          ],
        },
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', part.id);
  if (upErr) throw new Error(upErr.message);

  console.log(
    `CUT ${SKU}: $${part.price} → $${pricing.sellPrice} | Mag $${MAG} | cost $${COST} | freight $250/pair | ${newStripePrice.id}`
  );
  console.log(pricing.notes.join(' · '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
