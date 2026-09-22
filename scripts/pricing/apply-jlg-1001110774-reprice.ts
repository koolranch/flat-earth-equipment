/**
 * JLG 1001110774: BHE $542.85 is not a shippable offer (cart shipping error).
 * Mag $760.22 + $192 freight is the real same-warehouse street.
 * Cost $387.26. Raise $519 → $719 (~5% under Mag). Keep LTL $192.
 *
 * Run: npx tsx scripts/pricing/apply-jlg-1001110774-reprice.ts
 */

import path from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { calculateSellPrice } from '../../lib/pricing/calculateSellPrice';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SKU = '1001110774';
const COST = 387.26;
const MAG = 760.22;
const FREIGHT_CENTS = 19200;

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
      reason: 'bhe_unshippable_raise_to_mag_street',
    },
  });
  if (part.stripe_price_id) {
    await stripe.prices.update(part.stripe_price_id, { active: false });
  }

  const prior = (part.metadata ?? {}) as Record<string, unknown>;
  const prevComps = Array.isArray(prior.competitor_prices)
    ? (prior.competitor_prices as Array<Record<string, unknown>>)
    : [];
  const fetchedAt = new Date().toISOString();

  const { error: upErr } = await supabase
    .from('parts')
    .update({
      price: pricing.sellPrice,
      price_cents: Math.round(pricing.sellPrice * 100),
      stripe_price_id: newStripePrice.id,
      metadata: {
        ...prior,
        cost_wholesale: COST,
        freight_cents: FREIGHT_CENTS,
        competitor_prices: prevComps.map((p) =>
          p.source === 'bhe'
            ? {
                ...p,
                notes: 'page-1 card only — cart shipping not available on this 105 lb wheel',
                fetched_at: fetchedAt,
              }
            : p
        ),
        last_comp_pricing: {
          at: fetchedAt,
          method: pricing.method,
          comp_discount: pricing.compDiscountUsed ?? 0.05,
          margin_pct: Math.round(pricing.marginPct * 1000) / 10,
          notes: [
            ...pricing.notes,
            `Raised vs Mag $${MAG} after BHE $542.85 failed shipping. Sell $${pricing.sellPrice} · LTL $192`,
          ],
        },
      },
      updated_at: fetchedAt,
    })
    .eq('id', part.id);
  if (upErr) throw new Error(upErr.message);

  console.log(
    `RAISE ${SKU}: $${part.price} → $${pricing.sellPrice} | Mag $${MAG} | cost $${COST} | freight $192 | ${newStripePrice.id}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
