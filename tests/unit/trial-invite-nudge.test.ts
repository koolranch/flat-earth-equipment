import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { generateGfcTrialInviteNudgeEmail } from '../../lib/email/gfcTrainerWelcome';
import {
  isGfcEmployerTrialOrder,
  isInInviteNudgeWindow,
  trainerHasStartedInvites,
} from '../../lib/training/trialInviteNudge.server';

const cron = readFileSync('app/api/cron/trial-invite-nudge/route.ts', 'utf8');
const logic = readFileSync('lib/training/trialInviteNudge.server.ts', 'utf8');

const gfcTrial = {
  source_brand: 'gfc' as const,
  stripe_subscription_id: 'sub_123',
  subscription_status: 'trialing',
  seats: 10,
  is_unlimited: false,
};

test('GFC employer trial in the 2–10 day window is eligible', () => {
  assert.equal(isGfcEmployerTrialOrder(gfcTrial), true);
  const created = new Date('2026-09-13T12:00:00Z');
  const now = new Date('2026-09-16T15:00:00Z');
  assert.equal(isInInviteNudgeWindow(created, now), true);
});

test('FEE /safety solo buyers are excluded (null brand, no subscription)', () => {
  assert.equal(
    isGfcEmployerTrialOrder({
      source_brand: null,
      stripe_subscription_id: null,
      subscription_status: null,
      seats: 1,
    }),
    false,
  );
});

test('GFC $49 operator purchases are excluded (no subscription, one seat)', () => {
  assert.equal(
    isGfcEmployerTrialOrder({
      source_brand: 'gfc',
      stripe_subscription_id: null,
      subscription_status: null,
      seats: 1,
    }),
    false,
  );
});

test('paid or paused GFC subscriptions are excluded', () => {
  assert.equal(
    isGfcEmployerTrialOrder({ ...gfcTrial, subscription_status: 'active' }),
    false,
  );
  assert.equal(
    isGfcEmployerTrialOrder({ ...gfcTrial, subscription_status: 'paused' }),
    false,
  );
});

test('welcome-day and trial-ending week are outside the window', () => {
  const created = new Date('2026-09-15T12:00:00Z');
  assert.equal(isInInviteNudgeWindow(created, new Date('2026-09-16T11:00:00Z')), false);
  assert.equal(isInInviteNudgeWindow(created, new Date('2026-09-26T12:00:00Z')), false);
});

test('any invite or active claim skips the nudge', () => {
  const order = { id: 'ord_1', user_id: 'user_1' };
  assert.equal(
    trainerHasStartedInvites(order, [{ order_id: 'ord_1', created_by: 'user_1' }], []),
    true,
  );
  assert.equal(
    trainerHasStartedInvites(order, [{ order_id: null, created_by: 'user_1' }], []),
    true,
  );
  assert.equal(trainerHasStartedInvites(order, [], [{ order_id: 'ord_1' }]), true);
  assert.equal(trainerHasStartedInvites(order, [], []), false);
});

test('nudge copy is short, invites one operator, and stays off the $49 product', () => {
  const email = generateGfcTrialInviteNudgeEmail({ firstName: 'Dana' });
  assert.equal(email.subject, 'Invite one operator to start');
  assert.match(email.html, /Hi Dana,/);
  assert.match(email.html, /Invite one person/);
  assert.match(email.html, /under 30 minutes/);
  assert.match(email.html, /app\.getforkliftcertified\.com\/trainer/);
  assert.doesNotMatch(email.html, /\$49/);
  assert.doesNotMatch(email.html, /\u2014/);
});

test('cron is GFC-trial only and does not reuse renewals or reactivation', () => {
  assert.match(cron, /runTrialInviteNudge/);
  assert.match(logic, /\.eq\('source_brand', 'gfc'\)/);
  assert.match(logic, /\.eq\('subscription_status', 'trialing'\)/);
  assert.match(logic, /\.not\('stripe_subscription_id', 'is', null\)/);
  assert.doesNotMatch(cron, /send-training-welcome/);
  assert.doesNotMatch(cron, /reactivation/);
  assert.doesNotMatch(logic, /source_brand IS NULL/);
});
