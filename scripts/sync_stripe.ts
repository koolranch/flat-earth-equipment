import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

async function run() {
  const { data: parts, error } = await supabase
    .from('parts')
    .select('id, name, slug, price_cents')
    .is('stripe_price_id', null);

  if (error) throw error;

  for (const part of parts) {
    // 1) Create Stripe Product
    const product = await stripe.products.create({
      name: part.name,
    });

    // 2) Create Price (in cents, USD)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: part.price_cents!,
      currency: 'usd',
    });

    // 3) Save stripe_price_id back to Supabase
    const { error: updErr } = await supabase
      .from('parts')
      .update({ stripe_price_id: price.id })
      .eq('id', part.id);

    if (updErr) {
      console.error(`Failed to update part ${part.id}:`, updErr);
    } else {
      console.log(`✅ Synced ${part.slug} → ${price.id}`);
    }
  }
}

run().catch(console.error); 