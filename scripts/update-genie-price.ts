import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

async function updateGeniePrice() {
  // 1) Initialize clients
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 2) Get the part from Supabase
    const { data: part, error: fetchError } = await supabase
      .from('parts')
      .select('*')
      .eq('slug', 'genie-gen-6-ground-control-box')
      .single();

    if (fetchError) {
      console.error('Error fetching part:', fetchError);
      throw fetchError;
    }

    if (!part) {
      throw new Error('Part not found');
    }

    // 3) Create or get Stripe product
    let stripeProduct;
    if (part.stripe_product_id) {
      stripeProduct = await stripe.products.retrieve(part.stripe_product_id);
    } else {
      stripeProduct = await stripe.products.create({
        name: part.name,
        description: part.description,
        metadata: {
          sku: part.sku,
          brand: part.brand,
          category: part.category
        }
      });

      // Update Supabase with the new product ID
      const { error: updateProductError } = await supabase
        .from('parts')
        .update({ stripe_product_id: stripeProduct.id })
        .eq('slug', 'genie-gen-6-ground-control-box');

      if (updateProductError) {
        console.error('Error updating product ID:', updateProductError);
        throw updateProductError;
      }
    }

    // 4) Create the new one-time $750 Price in Stripe
    const price = await stripe.prices.create({
      unit_amount: 75000, // $750.00 in cents
      currency: 'usd',
      product: stripeProduct.id,
    });

    // 5) Update the price in Supabase
    const { error: updateError } = await supabase
      .from('parts')
      .update({ stripe_price_id: price.id })
      .eq('slug', 'genie-gen-6-ground-control-box');

    if (updateError) {
      console.error('Error updating part:', updateError);
      throw updateError;
    }

    console.log('✅ Successfully updated Genie Gen 6 Ground Control Box with new Stripe Price:', price.id);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateGeniePrice(); 