import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  try {
    // Create a new Stripe product for the test product
    const product = await stripe.products.create({
      name: 'Test Product 2',
      description: 'A test product for $1',
    });
    console.log('✅ Stripe product created:', product.id);

    // Create a price for the product ($1)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 100, // $1.00
      currency: 'usd',
    });
    console.log('✅ Stripe price created:', price.id);

    // Add the product to Supabase parts table
    const { error } = await supabase
      .from('parts')
      .insert({
        name: 'Test Product 2',
        slug: 'test-product-2',
        price: 1.00,
        category: 'test',
        brand: 'Test Brand',
        description: 'A test product for $1',
        sku: 'TEST-002',
        stripe_price_id: price.id,
        stripe_product_id: product.id,
      })

    if (error) {
      console.error('❌ Error adding product to Supabase:', error);
      process.exit(1);
    }
    console.log('✅ Product added to Supabase successfully');
  } catch (error) {
    console.error('❌ Error creating test product:', error);
    process.exit(1);
  }
}

main(); 