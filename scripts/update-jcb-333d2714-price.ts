/**
 * JCB 333/D2714: $1719 → $1769 (just under Mag $1779).
 *
 * Usage: npx tsx scripts/update-jcb-333d2714-price.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SKU = '333D2714';
const NEW_PRICE = 1769;
const MAG_COMP = 1779;
const COST = 1376.28;

async function main() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: part, error } = await supabase
    .from('parts')
    .select('id,sku,name,price,price_cents,stripe_product_id,stripe_price_id,metadata')
    .eq('sku', SKU)
    .single();

  if (error || !part) throw new Error(`Part ${SKU} not found: ${error?.message}`);
  if (!part.stripe_product_id) throw new Error(`Missing stripe_product_id on ${SKU}`);

  const oldPrice = Number(part.price);
  const newPriceCents = NEW_PRICE * 100;
  const marginPct = (NEW_PRICE - COST) / NEW_PRICE;
  console.log(
    `${part.name}: $${oldPrice} → $${NEW_PRICE} | Mag $${MAG_COMP} | margin ${(marginPct * 100).toFixed(1)}%`
  );

  const newStripePrice = await stripe.prices.create({
    product: part.stripe_product_id,
    unit_amount: newPriceCents,
    currency: 'usd',
    metadata: {
      sku: SKU,
      previous_price_cents: String(Math.round(oldPrice * 100)),
      reason: 'closer_to_mag_1779',
    },
  });
  console.log(`Stripe price: ${newStripePrice.id}`);

  if (part.stripe_price_id && part.stripe_price_id !== newStripePrice.id) {
    await stripe.prices.update(part.stripe_price_id, { active: false });
    console.log(`Archived ${part.stripe_price_id}`);
  }

  const priorMeta =
    part.metadata && typeof part.metadata === 'object'
      ? (part.metadata as Record<string, unknown>)
      : {};

  const { error: updateError } = await supabase
    .from('parts')
    .update({
      price: NEW_PRICE,
      price_cents: newPriceCents,
      stripe_price_id: newStripePrice.id,
      metadata: {
        ...priorMeta,
        pricing_method: 'just_under_mag',
        last_comp_pricing: {
          at: new Date().toISOString(),
          method: 'just_under_mag',
          notes: [`Sell $${NEW_PRICE} just under Mag $${MAG_COMP}`],
          margin_pct: Math.round(marginPct * 1000) / 10,
        },
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', part.id);

  if (updateError) throw new Error(`Supabase update failed: ${updateError.message}`);
  console.log('Supabase updated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
