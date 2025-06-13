import Stripe from 'stripe';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

async function main() {
  try {
    const shippingRate = await stripe.shippingRates.create({
      display_name: 'Free Shipping (Test Product)',
      type: 'fixed_amount',
      fixed_amount: {
        amount: 0,
        currency: 'usd',
      },
      delivery_estimate: {
        minimum: { unit: 'business_day', value: 1 },
        maximum: { unit: 'business_day', value: 5 },
      },
    });
    console.log('✅ Free shipping rate created:', shippingRate.id);
    console.log('Shipping Rate Object:', shippingRate);
  } catch (error) {
    console.error('❌ Error creating shipping rate:', error);
    process.exit(1);
  }
}

main(); 