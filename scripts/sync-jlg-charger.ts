import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

async function syncJlgCharger() {
  // 1) Initialize clients
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 2) Fetch the Supabase part row by slug
  const { data: part, error: fetchErr } = await supabase
    .from('parts')
    .select('id, name, description, price_cents, stripe_product_id')
    .eq('slug', 'jlg-24v-25a-on-board-charger-400238')
    .single();
  if (fetchErr) throw fetchErr;
  if (!part) throw new Error('JLG charger not found');

  // 3) Create a Stripe Product if not already set
  let productId = part.stripe_product_id;
  if (!productId) {
    const stripeProduct = await stripe.products.create({
      name: part.name,
      description: part.description || undefined,
      metadata: { supabase_id: part.id }
    });
    productId = stripeProduct.id;
    await supabase
      .from('parts')
      .update({ stripe_product_id: productId })
      .eq('id', part.id);
  }

  // 4) Create a one-time Stripe Price for $500
  const stripePrice = await stripe.prices.create({
    product: productId,
    unit_amount: part.price_cents, // should be 50000
    currency: 'usd'
  });

  // 5) Update Supabase with the new Price ID
  const { error: updateErr } = await supabase
    .from('parts')
    .update({ stripe_price_id: stripePrice.id })
    .eq('id', part.id);
  if (updateErr) throw updateErr;

  console.log('✅ JLG charger synced:', productId, stripePrice.id);
}

syncJlgCharger().catch(console.error); 