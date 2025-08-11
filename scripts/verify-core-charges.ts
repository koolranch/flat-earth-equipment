import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyCoreCharges() {
  try {
    // 1. Get all parts with core charges from Supabase
    const { data: parts, error } = await supabase
      .from('parts')
      .select('id, name, has_core_charge, core_charge, stripe_price_id, stripe_product_id')
      .eq('has_core_charge', true);

    if (error) {
      throw error;
    }

    console.log(`Found ${parts.length} parts with core charges`);

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
      } catch (err) {
        console.log('❌ Price not found in Stripe');
        continue;
      }

      // 5. Verify core charge amount
      if (typeof part.core_charge !== 'number' || part.core_charge <= 0) {
        console.log('❌ Invalid core charge amount:', part.core_charge);
        continue;
      }

      console.log('✅ Core charge amount:', part.core_charge);
      console.log('✅ All checks passed for this part');
    }

  } catch (error) {
    console.error('Error verifying core charges:', error);
    process.exit(1);
  }
}

verifyCoreCharges().catch(console.error); 