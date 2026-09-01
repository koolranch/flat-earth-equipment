import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// Seat soft-release: a trainer frees a departed operator's seat by setting
// seat_claims.released_at. These assertions lock in (1) the release route's
// guards, (2) that every capacity/recipient query ignores released claims,
// (3) that claim upserts reactivate released rows for rehires, and (4) that
// solo-buyer and audit-pack behavior is untouched.

const releaseRoute = readFileSync('app/api/trainer/seats/release/route.ts', 'utf8');

test('release route requires auth and trainer/admin role', () => {
  assert.match(releaseRoute, /getAuthUser\(req\)/);
  assert.match(releaseRoute, /\['trainer', 'admin'\]\.includes\(prof\.role\)/);
});

test('release route only touches claims on the calling trainer\'s own orders', () => {
  assert.match(releaseRoute, /\.from\('orders'\)\.select\('id'\)\.eq\('user_id', user\.id\)/);
  assert.match(releaseRoute, /\.in\('order_id', orderIds\)/);
});

test('release route soft-releases (never deletes) and never touches training records', () => {
  assert.match(releaseRoute, /update\(\{ released_at: new Date\(\)\.toISOString\(\), released_by: user\.id \}\)/);
  assert.doesNotMatch(releaseRoute, /\.delete\(/);
  assert.doesNotMatch(releaseRoute, /from\('enrollments'\)/);
  assert.doesNotMatch(releaseRoute, /from\('certificates'\)/);
  assert.doesNotMatch(releaseRoute, /from\('employer_evaluations'\)/);
});

// Every capacity / recipient / access query must ignore released claims.
const filteredFiles = [
  'lib/training/claimSeat.ts',
  'app/api/trainer/seat-invites/bulk/route.ts',
  'app/api/trainer/orders/route.ts',
  'app/api/cron/renewals/route.ts',
  'app/api/trainer/reminders/send/route.ts',
  'lib/training/exam-access.server.ts',
  'app/api/training/exam/validate-code/route.ts',
];

for (const file of filteredFiles) {
  test(`${file} excludes released seat claims`, () => {
    const source = readFileSync(file, 'utf8');
    assert.match(source, /\.is\('released_at', null\)/);
  });
}

// Rehires: claim upserts must clear released_at so a returning operator
// reactivates their old row instead of leaving it marked released.
const upsertFiles = [
  'lib/training/claimSeat.ts',
  'app/api/training/exam/validate-code/route.ts',
  'app/api/claim-training/route.ts',
];

for (const file of upsertFiles) {
  test(`${file} claim upsert reactivates released rows`, () => {
    const source = readFileSync(file, 'utf8');
    assert.match(source, /released_at: null/);
  });
}

test('audit pack deliberately keeps released (former) operators for OSHA retention', () => {
  const source = readFileSync('app/api/trainer/audit-pack/route.ts', 'utf8');
  assert.doesNotMatch(source, /released_at/);
});

test('roster separates former operators without dropping their records', () => {
  const source = readFileSync('app/api/trainer/roster/route.ts', 'utf8');
  assert.match(source, /released_at/);
  assert.match(source, /former/);
});

test('add-seats checkout returns GFC trainers to app.getforkliftcertified.com', () => {
  const source = readFileSync('app/api/trainer/orders/add-seats/route.ts', 'utf8');
  assert.match(source, /app\.getforkliftcertified\.com/);
  assert.match(source, /requestHost === 'app\.getforkliftcertified\.com'/);
});

test('migration counts only unreleased claims in v_order_seat_usage', () => {
  const source = readFileSync('supabase/migrations/20260831230000_seat_claims_soft_release.sql', 'utf8');
  assert.match(source, /FILTER \(WHERE sc\.released_at IS NULL\)/);
  assert.match(source, /ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ/);
});

// Solo-buyer safety: the Stripe webhook's solo/training fulfillment and the
// solo welcome email paths must not reference seat release at all.
test('stripe webhook and welcome emails are untouched by seat release', () => {
  const webhook = readFileSync('app/api/webhooks/stripe/route.ts', 'utf8');
  assert.doesNotMatch(webhook, /released_at/);
  const welcome = readFileSync('app/api/send-training-welcome/route.ts', 'utf8');
  assert.doesNotMatch(welcome, /released_at/);
});
