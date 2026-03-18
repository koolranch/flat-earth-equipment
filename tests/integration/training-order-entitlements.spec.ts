import { expect, test } from '@playwright/test';
import { getOrderSeatSummary, isUnlimitedOrderActive, selectClaimableOrder } from '../../lib/training/orderEntitlements';

test('finite seat packs keep existing remaining-seat math', () => {
  const summary = getOrderSeatSummary(
    {
      id: 'finite-order',
      seats: 25,
      is_unlimited: false,
    },
    4
  );

  expect(summary.isUnlimited).toBe(false);
  expect(summary.claimed).toBe(4);
  expect(summary.remaining).toBe(21);
  expect(summary.seatsLabel).toBe('25');
  expect(summary.remainingLabel).toBe('21');
  expect(summary.canAssign).toBe(true);
});

test('annual entitlement stays active through current period end', () => {
  const active = isUnlimitedOrderActive(
    {
      is_unlimited: true,
      subscription_status: 'past_due',
      current_period_end: '2026-12-31T23:59:59.000Z',
      ended_at: null,
    },
    new Date('2026-12-01T00:00:00.000Z')
  );

  const summary = getOrderSeatSummary(
    {
      id: 'annual-order',
      is_unlimited: true,
      subscription_status: 'past_due',
      current_period_end: '2026-12-31T23:59:59.000Z',
      ended_at: null,
    },
    37,
    new Date('2026-12-01T00:00:00.000Z')
  );

  expect(active).toBe(true);
  expect(summary.active).toBe(true);
  expect(summary.seatsLabel).toBe('Unlimited');
  expect(summary.remainingLabel).toBe('Unlimited');
  expect(summary.canAssign).toBe(true);
});

test('annual entitlement stops assigning after period end', () => {
  const summary = getOrderSeatSummary(
    {
      id: 'expired-annual-order',
      is_unlimited: true,
      subscription_status: 'canceled',
      current_period_end: '2026-02-01T00:00:00.000Z',
      ended_at: '2026-02-01T00:00:00.000Z',
    },
    12,
    new Date('2026-02-02T00:00:00.000Z')
  );

  expect(summary.active).toBe(false);
  expect(summary.remaining).toBe(0);
  expect(summary.remainingLabel).toBe('Expired');
  expect(summary.canAssign).toBe(false);
});

test('claim selection prefers active annual over older finite pack', () => {
  const selected = selectClaimableOrder(
    [
      {
        id: 'finite-pack',
        seats: 5,
        is_unlimited: false,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'annual-plan',
        seats: 999,
        is_unlimited: true,
        subscription_status: 'active',
        current_period_end: '2027-01-01T00:00:00.000Z',
        created_at: '2026-03-01T00:00:00.000Z',
      },
    ],
    {
      'finite-pack': 1,
      'annual-plan': 8,
    },
    new Date('2026-03-15T00:00:00.000Z')
  );

  expect(selected?.order.id).toBe('annual-plan');
  expect(selected?.summary.isUnlimited).toBe(true);
  expect(selected?.summary.canAssign).toBe(true);
});
