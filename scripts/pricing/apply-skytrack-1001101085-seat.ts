/**
 * Skytrack/JLG 1001101085 vinyl seat: true cost $492.52, Mag $624.63, 47 lb.
 * 20% floor lands at $619 (under Mag street). Seats freight $25, not LTL.
 * Vendor lists this PN as a JLG seat; URL slug stays Skytrack for SEO.
 */

import path from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { calculateSellPrice } from '../../lib/pricing/calculateSellPrice';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });

const SKU = 'SA1001101085';
const COST = 492.52;
const MAG = 624.63;
const NAME = 'JLG 1001101085 Seat Assembly';
const IMAGE = '/images/parts/seats/skytrack-1001101085-seat-assembly.jpg';
const DESCRIPTION =
  'Aftermarket vinyl suspension seat for JLG part number 1001101085. Mechanical suspension with slide rails and weight adjustment. Fits SkyTrak 6036, 6042, 8042, 10042, and 10054 telehandlers. About 23.5" H × 18.4" W × 23.2" D, black vinyl.';

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
      reason: 'true_cost_mag_floor',
    },
  });
  if (part.stripe_price_id) {
    await stripe.prices.update(part.stripe_price_id, { active: false });
  }
  await stripe.products.update(part.stripe_product_id, {
    name: NAME,
    description: DESCRIPTION,
    images: [`https://www.flatearthequipment.com${IMAGE}`],
  });

  const prior = (part.metadata ?? {}) as Record<string, unknown>;
  const { error: upErr } = await supabase
    .from('parts')
    .update({
      name: NAME,
      brand: 'JLG',
      description: DESCRIPTION,
      image_url: IMAGE,
      price: pricing.sellPrice,
      price_cents: Math.round(pricing.sellPrice * 100),
      stripe_price_id: newStripePrice.id,
      sales_type: 'direct',
      is_in_stock: true,
      weight_lbs: 47,
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
            `TVH net $${COST} · Mag $${MAG} · sell $${pricing.sellPrice} · 47 lb seat freight $25 (not LTL)`,
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
  console.log(pricing.notes.join(' · '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
