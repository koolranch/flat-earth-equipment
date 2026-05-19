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
