/**
 * Bobcat 7123864 swivel: $2799 → $2749 (under OEM $2823.49, Mag ~$3019).
 * Free freight unchanged. Merchant g:id stays 7123864.
 *
 * Usage: npx tsx scripts/update-bobcat-7123864-price.ts
 */
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SKU = '7123864';
const NEW_PRICE = 2749;
const OEM_COMP = 2823.49;
const MAG_COMP = 3019.54;
const COST = 2411.02;

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
  const profit = Math.round((NEW_PRICE - COST) * 100) / 100;
  console.log(
    `${part.name}: $${oldPrice} → $${NEW_PRICE} | profit $${profit} | OEM $${OEM_COMP} | Mag $${MAG_COMP}`
  );

  const newStripePrice = await stripe.prices.create({
    product: part.stripe_product_id,
    unit_amount: newPriceCents,
    currency: 'usd',
    metadata: {
      sku: SKU,
      previous_price_cents: String(Math.round(oldPrice * 100)),
      reason: 'under_oem_2749_visible_gap',
    },
  });
  console.log(`Stripe price: ${newStripePrice.id}`);

  if (part.stripe_price_id && part.stripe_price_id !== newStripePrice.id) {
    await stripe.prices.update(part.stripe_price_id, { active: false });
    console.log(`Archived ${part.stripe_price_id}`);
  }

  const priorMeta = (part.metadata && typeof part.metadata === 'object' ? part.metadata : {}) as Record<
    string,
    unknown
  >;
  const { error: updateError } = await supabase
    .from('parts')
    .update({
      price: NEW_PRICE,
      price_cents: newPriceCents,
      stripe_price_id: newStripePrice.id,
      metadata: {
        ...priorMeta,
        free_freight: true,
        cost_wholesale: COST,
        oem_list_price: OEM_COMP,
        comp_magnasource: MAG_COMP,
        margin_pct: Math.round((profit / NEW_PRICE) * 1000) / 10,
        pricing_method: 'under_oem_visible_gap_free_freight',
        pricing_note: `Sell $${NEW_PRICE} ($${profit} after cost $${COST}) under OEM $${OEM_COMP} and Mag $${MAG_COMP}; free freight. Next cut is not $2699.`,
        last_comp_pricing: {
          at: new Date().toISOString(),
          method: 'under_oem_visible_gap_free_freight',
          notes: [`$${oldPrice} → $${NEW_PRICE} vs OEM $${OEM_COMP}`],
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
