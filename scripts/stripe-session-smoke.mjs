import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_FORKLIFT;
const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
if (!key) { console.error('Missing STRIPE_SECRET_KEY'); process.exit(2); }
if (!priceId) { console.error('Missing STRIPE_PRICE_FORKLIFT'); process.exit(2); }
if (!key.startsWith('sk_test_')) { console.error('Refusing to run: use a TEST secret key (sk_test_...)'); process.exit(2); }

const stripe = new Stripe(key, { apiVersion: '2024-06-20' });

(async()=>{
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: baseUrl + '/training?checkout=success',
    cancel_url: baseUrl + '/training?checkout=cancel',
    allow_promotion_codes: true,
  });
  console.log('Created test Checkout Session URL:', session.url);

  // Immediately expire to avoid dangling sessions
  await stripe.checkout.sessions.expire(session.id);
  console.log('Expired test session:', session.id);
  console.log('\n✅ Stripe test-mode checkout smoke PASS (no charges made)');
})().catch(e=> { console.error('Stripe smoke failed:', e.message||e); process.exit(1); });
