import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

async function main() {
  try {
    // Create a new shipping rate
    const shippingRate = await stripe.shippingRates.create({
      display_name: 'Standard Ground Shipping',
      type: 'fixed_amount',
      fixed_amount: {
        amount: 3500, // $35.00
        currency: 'usd',
      },
      delivery_estimate: {
        minimum: {
          unit: 'business_day',
          value: 1,
        },
        maximum: {
          unit: 'business_day',
          value: 5,
        },
      },
    });

    console.log('✅ Default shipping rate created:', shippingRate.id);
    console.log('Shipping rate details:', {
      id: shippingRate.id,
      display_name: shippingRate.display_name,
      amount: shippingRate.fixed_amount?.amount,
      currency: shippingRate.fixed_amount?.currency,
    });
  } catch (error) {
    console.error('❌ Error creating shipping rate:', error);
    process.exit(1);
  }
}

main(); 