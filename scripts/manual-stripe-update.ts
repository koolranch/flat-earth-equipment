import Stripe from 'stripe';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

async function updateStripePrice(productId: string) {
  try {
    const newPrice = await stripe.prices.create({
      product: productId,
      unit_amount: 100, // $1.00 in cents
      currency: 'usd',
    });

    console.log(`New Stripe price created for product ${productId}:`, newPrice.id);
  } catch (error) {
    console.error(`Error updating Stripe price for product ${productId}:`, error);
    process.exit(1);
  }
}

// Update both test products
async function updateAllPrices() {
  // Replace these with your actual Stripe product IDs
  const testProductIds = [
    'prod_test_part_001', // Test Part 001
    'prod_test_part_002'  // Test Part 002
  ];

  for (const productId of testProductIds) {
    await updateStripePrice(productId);
  }
}

updateAllPrices(); 