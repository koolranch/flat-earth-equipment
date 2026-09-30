/**
 * Bobcat 6554149 window cord was Buy Now at $1.00.
 * Live Magnasource BC6554149 is $0.86 per foot (list $0.98), limited to 1 on hand (2026-09-29).
 * Bobcat of Atlanta and White Star Machinery both sell the same PN at $1.83 per foot.
 * $1 is the rounded 5% cut under Magnasource. Raise to $1.74 (5% under the $1.83 dealer per-foot price)
 * and label the unit per foot. No wholesale cost on file. g:id stays window-cord-6554149.
 *
 * Run: npx tsx scripts/pricing/apply-bobcat-6554149-window-cord.ts
 */

import path from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SKU = 'window-cord-6554149';
const SELL = 1.74;
const NAME = 'Bobcat 6554149 Window Cord, per foot';
const DESCRIPTION =
  'Sold by the foot. Used when installing Bobcat cab glass. A rear window usually takes about 7 feet, and a front door window about 10 feet. Fits Bobcat models including 463, 553AF, 632, 751, 753, 773, S100, S130, and more. Part number 6554149.';

async function main() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!stripeKey || !supabaseUrl || !serviceKey) {
    throw new Error('Missing Stripe or Supabase env');
  }

  const stripe = new Stripe(stripeKey);
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: part, error } = await supabase
    .from('parts')
    .select('id,price,price_cents,stripe_product_id,stripe_price_id,metadata,name')
    .eq('sku', SKU)
    .single();
  if (error || !part) throw new Error(error?.message ?? 'missing part');
  if (!part.stripe_product_id) throw new Error('missing stripe_product_id');

  const previousPriceId = part.stripe_price_id as string | null;
  const newStripePrice = await stripe.prices.create({
    product: part.stripe_product_id,
    unit_amount: Math.round(SELL * 100),
    currency: 'usd',
    metadata: {
      sku: SKU,
      previous_price_cents: String(part.price_cents),
      reason: 'per_foot_dealer_comps',
    },
  });

  await stripe.products.update(part.stripe_product_id, {
    name: NAME,
    description: DESCRIPTION.slice(0, 500),
  });

  const prior = (part.metadata ?? {}) as Record<string, unknown>;
  const prevComps = Array.isArray(prior.competitor_prices) ? prior.competitor_prices : [];
  const fetchedAt = new Date().toISOString();
  const dealerComps = [
    {
      source: 'bobcat_of_atlanta',
      price: 1.83,
      url: 'https://shop.bobcatofatlanta.com/products/window-cord-6554149',
      fetched_at: fetchedAt,
      selling_unit: 'FT',
      title: 'WINDOW CORD P/N 6554149, sold by the foot',
    },
    {
      source: 'white_star_machinery',
      price: 1.83,
      url: 'https://shop.whitestarmachinery.com/products/window-cord-6554149',
      fetched_at: fetchedAt,
      selling_unit: 'FT',
      title: 'WINDOW CORD P/N 6554149, sold by the foot',
    },
  ];
  const kept = prevComps.filter(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      (entry as { source?: string }).source !== 'bobcat_of_atlanta' &&
      (entry as { source?: string }).source !== 'white_star_machinery'
  );

  const { error: upErr } = await supabase
    .from('parts')
    .update({
      name: NAME,
      description: DESCRIPTION,
      price: SELL,
      price_cents: Math.round(SELL * 100),
      stripe_price_id: newStripePrice.id,
      metadata: {
        ...prior,
        competitor_prices: [...kept, ...dealerComps],
        provisional_pricing: true,
        provisional_pricing_note:
          'Per-foot sell set from dealer comps. Magnasource sticker is lower. Wholesale cost lands with the first PO.',
        last_comp_pricing: {
          at: fetchedAt,
          method: 'comp_discount',
          comp_discount: 0.05,
          margin_pct: null,
          notes: [
            'Provisional — no wholesale cost on file',
            'Dealer per-foot street $1.83 (Bobcat of Atlanta, White Star). Sell $1.74.',
            'Magnasource $0.86 per foot, list $0.98, limited to 1 on hand 2026-09-29. Not used as the cut because $1 was already that rounded sticker.',
          ],
        },
      },
      updated_at: fetchedAt,
    })
    .eq('id', part.id);

  if (upErr) {
    await stripe.prices.update(newStripePrice.id, { active: false });
    throw new Error(`db update failed, new price archived: ${upErr.message}`);
  }

  if (previousPriceId && previousPriceId !== newStripePrice.id) {
    try {
      await stripe.prices.update(previousPriceId, { active: false });
    } catch (e) {
      console.error(
        `Row points at ${newStripePrice.id}, but old price ${previousPriceId} could not be archived: ${(e as Error).message}`
      );
      process.exit(1);
    }
  }

  console.log(
    `REPRICE ${SKU}: $${part.price} → $${SELL} | dealers $1.83/ft | ${previousPriceId} archived | ${newStripePrice.id}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
