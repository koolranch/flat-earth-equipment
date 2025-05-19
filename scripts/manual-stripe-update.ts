import Stripe from 'stripe';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

async function updateStripePrice() {
  try {
    // Example: Update price for a product with ID 'prod_old_id' to 2000 cents ($20.00)
    const newPrice = await stripe.prices.create({
      product: 'prod_old_id', // Replace with actual product ID
      unit_amount: 2000, // Replace with actual new price in cents
      currency: 'usd',
    });

    console.log('New Stripe price created:', newPrice.id);
  } catch (error) {
    console.error('Error updating Stripe price:', error);
    process.exit(1);
  }
}

updateStripePrice(); 