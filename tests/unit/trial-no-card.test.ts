import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { SUBSCRIPTION_PLANS } from '../../lib/training/plans';
import { generateGfcTrainerWelcomeEmail, generateGfcTrialEndingEmail } from '../../lib/email/gfcTrainerWelcome';

const checkoutSource = readFileSync(new URL('../../app/api/checkout/route.ts', import.meta.url), 'utf8');
const webhookSource = readFileSync(new URL('../../app/api/webhooks/stripe/route.ts', import.meta.url), 'utf8');
const ordersSource = readFileSync(new URL('../../app/api/trainer/orders/route.ts', import.meta.url), 'utf8');

test('GFC employer plans carry a 14-day trial', () => {
  for (const plan of Object.values(SUBSCRIPTION_PLANS)) {
    assert.equal(plan.trialDays, 14, `${plan.id} trialDays`);
  }
});

test('checkout: no-card trial params apply only to GFC subscription sessions with a trial', () => {
  assert.match(
    checkoutSource,
    /const isGfcNoCardTrial =\s*isGfcSession && checkoutMode === 'subscription' && subscriptionTrialDays > 0;/,
  );
  // Card collection is skipped only behind that flag.
  assert.match(
    checkoutSource,
    /\.\.\.\(isGfcNoCardTrial \? \{ payment_method_collection: 'if_required' as const \} : \{\}\)/,
  );
  assert.equal((checkoutSource.match(/payment_method_collection/g) || []).length, 1);
  // A lapsed no-card trial pauses (keeps the order) rather than cancelling.
  assert.match(checkoutSource, /missing_payment_method: 'pause' as const/);
  assert.equal((checkoutSource.match(/trial_settings/g) || []).length, 1);
  // Operator ($49) and FEE sessions keep their existing tax + card behaviour.
  assert.match(checkoutSource, /automatic_tax: \{ enabled: !isGfcOperatorSession && !isGfcNoCardTrial \}/);
});

test('webhook: syncs pause/resume events, sends trial-ending notice, resumes on card added', () => {
  assert.match(webhookSource, /event\.type === 'customer\.subscription\.paused'/);
  assert.match(webhookSource, /event\.type === 'customer\.subscription\.resumed'/);
  assert.match(webhookSource, /event\.type === 'customer\.subscription\.trial_will_end'/);
  assert.match(webhookSource, /event\.type === 'payment_method\.attached' \|\| event\.type === 'customer\.updated'/);
  // Trial notice is GFC-only.
  assert.match(webhookSource, /order\.source_brand !== 'gfc'/);
  // Welcome email learns whether a card was collected.
  assert.match(webhookSource, /noCard: subscriptionSnapshot \? !subscriptionSnapshot\.has_payment_method : false/);
});

test('trainer orders API only touches Stripe for trialing / paused subscription orders', () => {
  assert.match(
    ordersSource,
    /if \(order\.subscription_status !== 'trialing' && order\.subscription_status !== 'paused'\) continue;/,
  );
  assert.match(ordersSource, /if \(!order\.stripe_subscription_id\) continue;/);
});

test('welcome email distinguishes no-card trials', () => {
  const base = { firstName: 'Dana', email: 'd@example.com', password: 'x', planId: 'crew_monthly', trialDays: 14 };
  const noCard = generateGfcTrainerWelcomeEmail({ ...base, noCard: true });
  assert.match(noCard.html, /14-day free trial is active — no card on file/);
  assert.match(noCard.html, /Nothing is\s+ever billed unless you choose to keep the plan/);

  const withCard = generateGfcTrainerWelcomeEmail({ ...base, noCard: false });
  assert.match(withCard.html, /14-day free trial is active\./);
  assert.doesNotMatch(withCard.html, /no card on file/);
});

test('trial-ending email: pause warning without a card, billing notice with one', () => {
  const ends = new Date('2026-09-23T12:00:00Z');
  const noCard = generateGfcTrialEndingEmail({
    firstName: 'Dana',
    trialEndsAt: ends,
    hasCard: false,
    operatorsInvited: 3,
    operatorsCertified: 1,
  });
  assert.match(noCard.subject, /add a card to keep your roster/);
  assert.match(noCard.html, /your account will pause/);
  assert.match(noCard.html, /If you do nothing, nothing is charged/);
  assert.match(noCard.html, /invited 3 operators and 1 has passed/);

  const withCard = generateGfcTrialEndingEmail({
    firstName: 'Dana',
    trialEndsAt: ends,
    hasCard: true,
    operatorsInvited: 0,
    operatorsCertified: 0,
  });
  assert.doesNotMatch(withCard.subject, /add a card/);
  assert.match(withCard.html, /Your plan starts billing on/);
  assert.match(withCard.html, /haven't invited any operators yet/);
});
