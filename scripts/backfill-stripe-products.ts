import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

async function backfillStripeData() {
  // 1) Initialize clients
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 2) Fetch all parts missing stripe_product_id
  const { data: parts, error: fetchError } = await supabase
    .from('parts')
    .select('id, name, description, price, price_cents')
    .is('stripe_product_id', null);

  if (fetchError) throw fetchError;
  if (!parts || parts.length === 0) {
    console.log('No parts need backfilling.');
    return;
  }

  for (const part of parts) {
    // 3) Create a Stripe Product
    const stripeProduct = await stripe.products.create({
      name: part.name,
      description: part.description || undefined,
      metadata: { supabase_id: part.id }
    });

    // 4) Update Supabase with stripe_product_id
    const { error: updateProdErr } = await supabase
      .from('parts')
      .update({ stripe_product_id: stripeProduct.id })
      .eq('id', part.id);
    if (updateProdErr) throw updateProdErr;

    // 5) Create a one-time Stripe Price for this product
    const unit_amount = part.price_cents ?? Math.round(Number(part.price) * 100);
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount,
      currency: 'usd'
    });

    // 6) Update Supabase with stripe_price_id
    const { error: updatePriceErr } = await supabase
      .from('parts')
      .update({ stripe_price_id: stripePrice.id })
      .eq('id', part.id);
    if (updatePriceErr) throw updatePriceErr;

    console.log(`✅ Synced part ${part.name}: product ${stripeProduct.id}, price ${stripePrice.id}`);
  }
}

backfillStripeData().catch(console.error); 