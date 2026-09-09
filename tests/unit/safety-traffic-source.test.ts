import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { detectSafetyTrafficSource } from '../../lib/safety/traffic-source';

test('detects Google Ads traffic from gclid', () => {
  assert.equal(
    detectSafetyTrafficSource({
      searchParams: { gclid: 'test123', state: 'texas' },
      cookies: {},
    }),
    'ad',
  );
});

test('detects Google Ads traffic from Google CPC UTM parameters', () => {
  assert.equal(
    detectSafetyTrafficSource({
      searchParams: { utm_source: 'google', utm_medium: 'cpc' },
      cookies: {},
    }),
    'ad',
  );
});

test('detects returning Google Ads visitors from _gcl_aw cookie', () => {
  assert.equal(
    detectSafetyTrafficSource({
      searchParams: { state: 'florida' },
      cookies: { _gcl_aw: 'GCL.123' },
    }),
    'ad',
  );
});

test('treats non-Google campaign traffic as organic for now', () => {
  assert.equal(
    detectSafetyTrafficSource({
      searchParams: { utm_source: 'facebook', utm_medium: 'social' },
      cookies: {},
    }),
    'organic',
  );
});

test('checkout route is never gated by FEATURE_GA', () => {
  const source = readFileSync('app/api/checkout/route.ts', 'utf8');
  assert.equal(source.includes('FEATURE_GA'), false);
  assert.equal(source.includes('not_open'), false);
});

test('training checkout skips shipping; parts checkout still collects it', () => {
  const source = readFileSync('app/api/checkout/route.ts', 'utf8');
  assert.match(source, /!isTrainingPurchase/);
  assert.match(source, /shipping_address_collection: \{ allowed_countries: \["US", "CA"\] \}/);
  assert.equal(
    source.includes('shipping_address_collection: { allowed_countries: ["US", "CA"] },\n      ...(checkoutMode'),
    false,
    'shipping must not be applied unconditionally to every checkout session',
  );
});

test('GFC return_base checkouts get Forklift Certified branding; FEE path does not', () => {
  const source = readFileSync('app/api/checkout/route.ts', 'utf8');
  assert.match(source, /display_name: "Forklift Certified"/);
  assert.match(source, /You won't be charged today/);
  assert.match(source, /ALLOWED_RETURN_HOSTS/);
  assert.match(source, /getforkliftcertified\.com/);
});

test('trial custom_text only applies to subscription checkouts, not one-time GFC purchases', () => {
  const source = readFileSync('app/api/checkout/route.ts', 'utf8');
  // custom_text is GFC-only, and the "won't be charged today" wording is
  // selected by checkoutMode so a one-time $49 purchase never sees it.
  assert.match(source, /\.\.\.\(isGfcSession\s*\n?\s*\?\s*\{\s*\n?\s*custom_text/);
  assert.match(
    source,
    /checkoutMode === 'subscription'\s*\n?\s*\?\s*"You won't be charged today/,
  );
});

test('GFC operator email prefill + 1h expiry/recovery are gated to GFC one-time training sessions', () => {
  const source = readFileSync('app/api/checkout/route.ts', 'utf8');
  // customer_email from the body is only read inside the GFC payment-mode guard.
  assert.match(
    source,
    /isGfcSession &&\s*\n\s*checkoutMode === 'payment' &&\s*\n\s*isTrainingPurchase &&\s*\n\s*typeof body\.customer_email === 'string'/,
  );
  // Existing exam-unlock / ask-employer prefills win over the GFC body email.
  assert.match(
    source,
    /askEmployerCustomerEmail \?\? examUnlockCustomerEmail \?\? gfcOperatorCustomerEmail/,
  );
  // expires_at / after_expiration only on isGfcOperatorSession, never unconditionally.
  assert.match(source, /\.\.\.\(isGfcOperatorSession\s*\n?\s*\?\s*\{\s*\n?\s*expires_at/);
  assert.match(source, /after_expiration: \{ recovery: \{ enabled: true/);
  assert.equal(
    (source.match(/expires_at:/g) || []).length,
    1,
    'expires_at must appear exactly once, inside the GFC operator guard',
  );
  assert.match(
    source,
    /const isGfcOperatorSession = isGfcSession && checkoutMode === 'payment' && isTrainingPurchase/,
  );
  // Stripe Tax (and therefore the billing-address form) is skipped only for
  // the GFC $49 operator session. Every other session — parts, FEE /safety,
  // GFC employer subscriptions — keeps automatic tax on.
  assert.match(source, /automatic_tax: \{ enabled: !isGfcOperatorSession \}/);
  assert.equal((source.match(/automatic_tax:/g) || []).length, 1);
});

test('checkout recovery module only matches GFC one-time operator sessions', () => {
  const source = readFileSync('lib/training/checkoutRecovery.server.ts', 'utf8');
  assert.match(source, /session\.mode === 'payment'/);
  assert.match(source, /item_0_utm_source === 'getforkliftcertified\.com'/);
  assert.match(source, /course_slug === 'forklift'/);
  assert.match(source, /purchase_type !== 'extra_seats'/);
  const webhook = readFileSync('app/api/webhooks/stripe/route.ts', 'utf8');
  // Cancel-on-purchase is inside the isGfcCheckout guard.
  assert.match(webhook, /if \(isGfcCheckout && isGfcOperatorCheckoutSession\(session\)\)/);
});

test('return_base success/cancel path overrides are restricted to same-site paths', () => {
  const source = readFileSync('app/api/checkout/route.ts', 'utf8');
  assert.match(source, /function safeReturnPath/);
  assert.match(source, /\^\\\/\(\?!\\\/\)/); // must reject protocol-relative //host paths
  // Defaults preserved when no override is sent.
  assert.match(source, /successPath \?\? '\/checkout\/success'/);
  assert.match(source, /cancelPath \?\? '\/#pricing'/);
});
