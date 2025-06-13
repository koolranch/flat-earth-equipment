import Stripe from 'stripe';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

async function archiveDuplicateShippingRates() {
  try {
    // Archive duplicate free shipping rate
    await stripe.shippingRates.update('shr_1RZdGvHJI548rO8Jt0aY9ZIa', {
      active: false
    });
    console.log('✅ Archived duplicate free shipping rate');

    // Archive duplicate standard shipping rate
    await stripe.shippingRates.update('shr_1RZdinHJI548rO8JYgwzuQuP', {
      active: false
    });
    console.log('✅ Archived duplicate standard shipping rate');

    console.log('🎉 Successfully cleaned up shipping rates');
  } catch (error) {
    console.error('❌ Error archiving shipping rates:', error);
    process.exit(1);
  }
}

archiveDuplicateShippingRates(); 