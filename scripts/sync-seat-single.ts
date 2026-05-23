/**
 * Price a single seat SKU.
 * Usage: npx tsx scripts/sync-seat-single.ts JC40/910651-BACK 57.73
 */
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function sellPrice(cost: number, kind: 'assembly' | 'cushion'): number {
  const mult = kind === 'assembly' ? (cost >= 400 ? 1.25 : 1.3) : 1.35;
  let price = cost * mult;
  if (kind === 'assembly' && cost >= 400) price = Math.ceil(price / 10) * 10 - 1;
  else price = Math.ceil(price);
  return price;
}

async function main() {
  const sku = process.argv[2];
  const cost = parseFloat(process.argv[3]);
  if (!sku || isNaN(cost)) {
    console.error('Usage: npx tsx scripts/sync-seat-single.ts <sku> <cost>');
    process.exit(1);
  }

  const { data: part, error } = await supabase.from('parts').select('*').eq('sku', sku).single();
  if (error || !part) throw new Error(`SKU not found: ${sku}`);

  const kind = part.category === 'Seat cushions' ? 'cushion' : 'assembly';
  const sell = sellPrice(cost, kind);

  let stripeProductId = part.stripe_product_id;
  if (!stripeProductId) {
    const product = await stripe.products.create({
      name: part.name,
      description: part.description?.slice(0, 500),
      metadata: { sku: part.sku, oem_reference: part.oem_reference, brand: part.brand },
    });
    stripeProductId = product.id;
  }

  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(sell * 100),
    currency: 'usd',
    metadata: { sku: part.sku },
  });

  const { error: upErr } = await supabase
    .from('parts')
    .update({
      name: part.name.includes('Foam') ? part.name : 'JCB JC40/910651 Seat Foam Cushion Kit (Back)',
      description:
        sku === 'JC40/910651-BACK'
          ? [
              'JCB JC40/910651 seat back foam cushion kit. Fits JCB 506-36, 507-42, 509-42, 510-56, 512-56, 514-56, and 535-95 Loadall models.',
              'Replacement molded foam back cushion for rebuilding a worn JCB operator seat. Pair with JC40/910654 bottom foam kit for a complete cushion rebuild.',
            ].join('\n\n')
          : part.description,
      price: sell,
      price_cents: Math.round(sell * 100),
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePrice.id,
      sales_type: 'direct',
      is_in_stock: true,
      metadata: { ...(part.metadata as object), cost_wholesale: cost },
      updated_at: new Date().toISOString(),
    })
    .eq('id', part.id);

  if (upErr) throw upErr;
  console.log(`✅ ${sku}: $${cost} → $${sell} | https://www.flatearthequipment.com/parts/${part.slug}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
