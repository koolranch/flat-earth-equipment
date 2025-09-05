import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error('Missing STRIPE_SECRET_KEY'); process.exit(2); }
const stripe = new Stripe(key, { apiVersion: '2024-06-20' });

const priceId = process.env.STRIPE_PRICE_FORKLIFT; // e.g., price_123
const hookSecret = process.env.STRIPE_WEBHOOK_SECRET || '(unset)';

function out(title, obj){
  console.log('\n' + title);
  console.table(obj);
}

(async()=>{
  // 1) Account mode & keys sanity
  const acct = await stripe.accounts.retrieve();
  const isTestKey = key.startsWith('sk_test_');
  const mode = isTestKey ? 'test' : 'live';
  out('Account', { id: acct.id, business: acct.business_profile?.name||'(n/a)', mode });

  // 2) Price lookup (if provided)
  if (priceId){
    const price = await stripe.prices.retrieve(priceId);
    const product = typeof price.product === 'string' ? await stripe.products.retrieve(price.product) : price.product;
    out('Price', { id: price.id, currency: price.currency, unit_amount: price.unit_amount, recurring: !!price.recurring, active: price.active });
    out('Product', { id: product.id, name: product.name, active: product.active });
    if (!price.active || !product.active){
      console.error('Price/Product is not active');
      process.exit(3);
    }
    if (!price.currency){ console.error('Price missing currency'); process.exit(3); }
  } else {
    console.warn('STRIPE_PRICE_FORKLIFT not set — skipping price check');
  }

  // 3) Webhooks (cannot list signing secrets; just warn)
  out('Webhook', { STRIPE_WEBHOOK_SECRET: hookSecret.substring(0,6) + '…' });

  console.log('\n✅ Stripe read-only verification PASS');
})().catch(e=> { console.error('Stripe verification failed:', e.message||e); process.exit(1); });
