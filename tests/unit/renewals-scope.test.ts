import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Renewal reminders: managed operators (any brand) plus GFC $49 solo buyers.
// FEE /safety solo buyers must stay out of scope — that is long-standing
// behaviour and changing it is a product decision, not a side effect.
const cron = readFileSync('app/api/cron/renewals/route.ts', 'utf8');

test('solo matching is restricted to one-time single-seat GFC orders', () => {
  assert.match(cron, /\.eq\('source_brand', 'gfc'\)/);
  assert.match(cron, /\.eq\('seats', 1\)/);
  assert.match(cron, /\.is\('stripe_subscription_id', null\)/);
});

test('FEE solo buyers (no claim, no GFC order) are still skipped', () => {
  assert.match(cron, /if \(!claim && !isGfcSolo\) continue;/);
});

test('solo buyers never generate a manager digest', () => {
  assert.match(cron, /if \(!order\) continue; \/\/ no manager digest for solo buyers/);
});

test('solo renewal email points at self-serve re-purchase, not an assigned seat', () => {
  const resend = readFileSync('lib/email/resend.ts', 'utf8');
  assert.match(resend, /solo\?: boolean;/);
  assert.match(resend, /getforkliftcertified\.com\/certification/);
  // The manager footer must be conditional now that solo buyers receive this email.
  assert.match(resend, /isSolo\s*\?/);
});

test('wallet card never claims "OSHA Certified"', () => {
  const card = readFileSync('lib/pdf/generateWalletCard.ts', 'utf8');
  assert.doesNotMatch(card, /drawText\('Certified'/);
  assert.match(card, /drawText\('1910\.178'/);
});
