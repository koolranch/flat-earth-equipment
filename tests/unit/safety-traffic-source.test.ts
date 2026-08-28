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
  assert.match(source, /returnBase && checkoutMode === 'subscription'\s*\n?\s*\?\s*\{\s*\n?\s*custom_text/);
});

test('return_base success/cancel path overrides are restricted to same-site paths', () => {
  const source = readFileSync('app/api/checkout/route.ts', 'utf8');
  assert.match(source, /function safeReturnPath/);
  assert.match(source, /\^\\\/\(\?!\\\/\)/); // must reject protocol-relative //host paths
  // Defaults preserved when no override is sent.
  assert.match(source, /successPath \?\? '\/checkout\/success'/);
  assert.match(source, /cancelPath \?\? '\/#pricing'/);
});
