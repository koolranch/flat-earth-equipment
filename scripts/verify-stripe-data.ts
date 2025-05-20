import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyStripeData() {
  try {
    // 1. Get all parts from Supabase
    const { data: parts, error } = await supabase
      .from('parts')
      .select('id, name, slug, stripe_product_id, stripe_price_id, price_cents');

    if (error) {
      throw error;
    }

    console.log(`Found ${parts.length} parts to verify`);

    // 2. Verify each part
    for (const part of parts) {
      console.log(`\nVerifying ${part.name}:`);
      
      if (!part.stripe_product_id) {
        console.log('❌ Missing stripe_product_id');
        continue;
      }

      if (!part.stripe_price_id) {
        console.log('❌ Missing stripe_price_id');
        continue;
      }

      // 3. Verify the product exists in Stripe
      try {
        const stripeProduct = await stripe.products.retrieve(part.stripe_product_id);
        console.log('✅ Product exists in Stripe:', stripeProduct.id);
      } catch (err) {
        console.log('❌ Product not found in Stripe');
        continue;
      }

      // 4. Verify the price exists in Stripe
      try {
        const stripePrice = await stripe.prices.retrieve(part.stripe_price_id);
        console.log('✅ Price exists in Stripe:', stripePrice.id);
        
        // 5. Verify price amount matches
        if (stripePrice.unit_amount !== part.price_cents) {
          console.log('❌ Price amount mismatch:', {
            stripe: stripePrice.unit_amount,
            supabase: part.price_cents
          });
        } else {
          console.log('✅ Price amount matches:', part.price_cents);
        }
      } catch (err) {
        console.log('❌ Price not found in Stripe');
        continue;
      }

      console.log('✅ All checks passed for this part');
    }

  } catch (error) {
    console.error('Error verifying Stripe data:', error);
    process.exit(1);
  }
}

verifyStripeData().catch(console.error); 