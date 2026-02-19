import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

async function main() {
  try {
    const existing = await stripe.coupons.retrieve('referral_10_off');
    console.log('Coupon already exists:', existing.id);
    return;
  } catch {
    // Coupon doesn't exist yet
  }

  const coupon = await stripe.coupons.create({
    id: 'referral_10_off',
    name: 'Referral Discount — $10 Off',
    amount_off: 1000,
    currency: 'usd',
    duration: 'once',
  });

  console.log('Created coupon:', coupon.id);
}

main().catch(console.error);
