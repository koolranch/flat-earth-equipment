/**
 * JCB 334/G3689: Equipment Share $121.85 is the page-1 street (Mag $150.14 is high).
 * Cost $77.28. Cut $143 → $116 (~5% under Equipment Share). Freight $25.
 *
 * Run: npx tsx scripts/pricing/apply-jcb-334g3689-reprice.ts
 */

import path from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { calculateSellPrice } from '../../lib/pricing/calculateSellPrice';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SKU = '334G3689';
const COST = 77.28;
const STREET = 121.85;
const MAG = 150.14;
const FREIGHT_CENTS = 2500;

async function main() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const pricing = calculateSellPrice({
    cost: COST,
    compPrice: STREET,
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
      reason: 'equipment_share_street',
    },
  });
  if (part.stripe_price_id) {
    await stripe.prices.update(part.stripe_price_id, { active: false });
  }

  const prior = (part.metadata ?? {}) as Record<string, unknown>;
  const fetchedAt = new Date().toISOString();
  const prevComps = Array.isArray(prior.competitor_prices)
    ? (prior.competitor_prices as Array<Record<string, unknown>>).filter(
        (p) => p.source !== 'equipment_share'
      )
    : [];

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
        competitor_prices: [
          ...prevComps,
          {
            source: 'equipment_share',
            price: STREET,
            fetched_at: fetchedAt,
            title: 'JCB 334/G3689 Header Tank',
            notes: 'page-1 street; Mag $150.14 is high',
          },
        ],
        last_comp_pricing: {
          at: fetchedAt,
          method: pricing.method,
          comp_discount: pricing.compDiscountUsed ?? 0.05,
          margin_pct: Math.round(pricing.marginPct * 1000) / 10,
          notes: [
            ...pricing.notes,
            `Cut vs Equipment Share $${STREET} (not Mag $${MAG}). Sell $${pricing.sellPrice} · freight $25`,
          ],
        },
      },
      updated_at: fetchedAt,
    })
    .eq('id', part.id);
  if (upErr) throw new Error(upErr.message);

  console.log(
    `CUT ${SKU}: $${part.price} → $${pricing.sellPrice} | Equipment Share $${STREET} | Mag $${MAG} | cost $${COST} | ${newStripePrice.id}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
