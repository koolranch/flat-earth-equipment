import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function main() {
  try {
    // List all shipping rates
    const shippingRates = await stripe.shippingRates.list({
      limit: 10,
    });

    console.log('📦 Found shipping rates:', shippingRates.data.length);
    
    // Check each shipping rate
    for (const rate of shippingRates.data) {
      console.log('\nShipping Rate:', {
        id: rate.id,
        display_name: rate.display_name,
        active: rate.active,
        amount: rate.fixed_amount?.amount,
        currency: rate.fixed_amount?.currency,
      });
    }

    // Specifically check our two shipping rates
    const freeShipping = shippingRates.data.find(r => r.id === 'shr_1RZdQkHJI548rO8JQOmkLnwc');
    const defaultShipping = shippingRates.data.find(r => r.id === 'shr_1RZdinHJI548rO8JYgwzuQuP');

    console.log('\n🔍 Specific Shipping Rates:');
    console.log('Free Shipping:', freeShipping ? {
      id: freeShipping.id,
      active: freeShipping.active,
      amount: freeShipping.fixed_amount?.amount,
    } : 'Not found');
    
    console.log('Default Shipping:', defaultShipping ? {
      id: defaultShipping.id,
      active: defaultShipping.active,
      amount: defaultShipping.fixed_amount?.amount,
    } : 'Not found');

  } catch (error) {
    console.error('❌ Error verifying shipping rates:', error);
    process.exit(1);
  }
}

main(); 