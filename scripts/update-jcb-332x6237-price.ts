/**
 * JCB 332/X6237: $1639 → $1699 (under Mag $1721.71) + TVH prepaid free freight.
 *
 * Usage: npx tsx scripts/update-jcb-332x6237-price.ts
 */
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SKU = '332X6237';
const NEW_PRICE = 1699;
const MAG_COMP = 1721.71;

const DESCRIPTION =
  'Aftermarket left-hand joystick for JCB equipment. Replaces OEM part number 332/X6237 — built to fit the same application (LH SP 3-function style). Contoured grip with top-mounted switches, rubber dust boot, and dual harness connectors. Match the part number on your existing joystick or in the parts manual before ordering. In stock. Free freight to the contiguous US.';

async function main() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: part, error } = await supabase
    .from('parts')
    .select('id,sku,name,price,price_cents,stripe_product_id,stripe_price_id,description,metadata')
    .eq('sku', SKU)
    .single();

  if (error || !part) throw new Error(`Part ${SKU} not found: ${error?.message}`);
  if (!part.stripe_product_id) throw new Error(`Missing stripe_product_id on ${SKU}`);

  const oldPrice = Number(part.price);
  const newPriceCents = NEW_PRICE * 100;
  console.log(`${part.name}: $${oldPrice} → $${NEW_PRICE} | free_freight | Mag $${MAG_COMP}`);

  const newStripePrice = await stripe.prices.create({
    product: part.stripe_product_id,
    unit_amount: newPriceCents,
    currency: 'usd',
    metadata: {
      sku: SKU,
      previous_price_cents: String(Math.round(oldPrice * 100)),
      reason: 'under_mag_1721_free_freight',
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
      description: DESCRIPTION,
      metadata: {
        ...priorMeta,
        free_freight: true,
        vendor_supply_chain: 'tvh',
        pricing_method: 'under_mag_with_free_freight',
        comp_magnasource: MAG_COMP,
        competitor_prices: [
          { price: MAG_COMP, source: 'magnasource', fetched_at: new Date().toISOString() },
        ],
        last_comp_pricing: {
          at: new Date().toISOString(),
          method: 'under_mag_with_free_freight',
          notes: [`Sell $${NEW_PRICE} under Mag $${MAG_COMP}; TVH prepaid free freight`],
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
