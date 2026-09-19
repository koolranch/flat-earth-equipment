/**
 * JCB 333/D8766 air filter: true cost $387.76 vs Mag $550.78.
 * Prior $480.39 cost held sell at $599 (above Mag). 2 lb — JCB ground, not LTL.
 */

import path from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { calculateSellPrice } from '../../lib/pricing/calculateSellPrice';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });

const SKU = '333D8766';
const COST = 387.76;
const MAG = 550.78;

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
      reason: 'true_cost_mag_undercut',
    },
  });
  if (part.stripe_price_id) {
    await stripe.prices.update(part.stripe_price_id, { active: false });
  }

  const prior = (part.metadata ?? {}) as Record<string, unknown>;
  const { error: upErr } = await supabase
    .from('parts')
    .update({
      price: pricing.sellPrice,
      price_cents: Math.round(pricing.sellPrice * 100),
      stripe_price_id: newStripePrice.id,
      sales_type: 'direct',
      is_in_stock: true,
      weight_lbs: 2,
      metadata: {
        ...prior,
        cost_wholesale: COST,
        free_freight: false,
        provisional_pricing: false,
        last_comp_pricing: {
          at: new Date().toISOString(),
          method: pricing.method,
          comp_discount: pricing.compDiscountUsed ?? 0.05,
          margin_pct: Math.round(pricing.marginPct * 1000) / 10,
          notes: [
            ...pricing.notes,
            `TVH net $${COST} · Mag $${MAG} · sell $${pricing.sellPrice} · 2 lb JCB ground`,
          ],
        },
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', part.id);
  if (upErr) throw new Error(upErr.message);

  console.log(
    `CUT ${SKU}: $${part.price} → $${pricing.sellPrice} | Mag $${MAG} | cost $${COST} | ${newStripePrice.id}`
  );
  console.log(pricing.notes.join(' · ') || 'comp−5%');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
