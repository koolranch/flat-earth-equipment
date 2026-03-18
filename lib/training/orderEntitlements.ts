export type TrainingOrderEntitlement = {
  id: string;
  seats?: number | null;
  is_unlimited?: boolean | null;
  subscription_status?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
  ended_at?: string | null;
  created_at?: string | null;
  stripe_subscription_id?: string | null;
};

export type TrainingOrderSeatSummary = {
  active: boolean;
  isUnlimited: boolean;
  seats: number;
  claimed: number;
  remaining: number;
  seatsLabel: string;
  remainingLabel: string;
  canAssign: boolean;
};

function parseIsoDate(value?: string | null): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function isUnlimitedOrderActive(
  order: Pick<TrainingOrderEntitlement, 'is_unlimited' | 'subscription_status' | 'current_period_end' | 'ended_at'>,
  now = new Date()
): boolean {
  if (!order.is_unlimited) return false;

  const nowMs = now.getTime();
  const endedAtMs = parseIsoDate(order.ended_at);
  if (endedAtMs !== null) {
    return endedAtMs > nowMs;
  }

  const currentPeriodEndMs = parseIsoDate(order.current_period_end);
  if (currentPeriodEndMs !== null) {
    return currentPeriodEndMs > nowMs;
  }

  const status = order.subscription_status || '';
  return ['active', 'trialing', 'past_due', 'unpaid', 'canceled'].includes(status);
}

export function getOrderSeatSummary(
  order: TrainingOrderEntitlement,
  claimedCount: number,
  now = new Date()
): TrainingOrderSeatSummary {
  const claimed = Math.max(0, claimedCount || 0);

  if (order.is_unlimited) {
    const active = isUnlimitedOrderActive(order, now);
    return {
      active,
      isUnlimited: true,
      seats: 0,
      claimed,
      remaining: 0,
      seatsLabel: 'Unlimited',
      remainingLabel: active ? 'Unlimited' : 'Expired',
      canAssign: active,
    };
  }

  const seats = Math.max(0, order.seats || 0);
  const remaining = Math.max(0, seats - claimed);
  return {
    active: true,
    isUnlimited: false,
    seats,
    claimed,
    remaining,
    seatsLabel: String(seats),
    remainingLabel: String(remaining),
    canAssign: remaining > 0,
  };
}

export function selectClaimableOrder<T extends TrainingOrderEntitlement>(
  orders: T[],
  claimedByOrderId: Record<string, number>,
  now = new Date()
): { order: T; summary: TrainingOrderSeatSummary } | null {
  const ranked = orders
    .map((order) => ({
      order,
      summary: getOrderSeatSummary(order, claimedByOrderId[order.id] || 0, now),
      createdAtMs: parseIsoDate(order.created_at) || 0,
    }))
    .filter((entry) => entry.summary.canAssign)
    .sort((a, b) => {
      if (a.summary.isUnlimited !== b.summary.isUnlimited) {
        return a.summary.isUnlimited ? -1 : 1;
      }
      return b.createdAtMs - a.createdAtMs;
    });

  if (!ranked.length) return null;
  return ranked[0];
}
