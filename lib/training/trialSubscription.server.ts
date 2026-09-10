import 'server-only';
import type Stripe from 'stripe';

/**
 * No-card employer trials (getforkliftcertified.com Crew / Facility).
 *
 * Checkout creates the subscription with `payment_method_collection:
 * 'if_required'` and `trial_settings.end_behavior.missing_payment_method:
 * 'pause'`, so a trial that lapses without a card lands in Stripe status
 * `paused` instead of being deleted. The trainer adds a card through the
 * customer portal; the moment Stripe has a default payment method we resume
 * the same subscription, which keeps the original order — roster, seat
 * claims, evaluations, certificates — intact.
 *
 * Used by the Stripe webhook (payment_method.attached / customer.updated) and
 * by /api/trainer/orders (so the dashboard reflects the card the trainer just
 * added even if the webhook is a few seconds behind).
 */

export type TrialBillingState = {
  status: Stripe.Subscription.Status;
  hasPaymentMethod: boolean;
  /** ISO date the trial ends / ended (Stripe `trial_end`), if any. */
  trialEnd: string | null;
  /** True when this call resumed a paused trial. */
  resumed: boolean;
};

// Kept intentionally shallow (see lib/training/sourceBrand.ts).
type OrdersClient = { from: (table: string) => any };

function isoFromUnix(ts?: number | null) {
  return ts ? new Date(ts * 1000).toISOString() : null;
}

function paymentMethodId(
  value: string | Stripe.PaymentMethod | Stripe.Customer | Stripe.DeletedCustomer | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

/**
 * A subscription bills against its own default payment method, falling back
 * to the customer's invoice default. The portal's "add payment method" flow
 * sets the customer default, so both have to be checked.
 */
export async function subscriptionHasPaymentMethod(
  stripe: Stripe,
  subscription: Stripe.Subscription,
): Promise<boolean> {
  if (paymentMethodId(subscription.default_payment_method)) return true;
  if (subscription.default_source) return true;

  const customerId = paymentMethodId(subscription.customer);
  if (!customerId) return false;
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return false;
  return Boolean(
    paymentMethodId(customer.invoice_settings?.default_payment_method) || customer.default_source,
  );
}

/**
 * Resume a trial that Stripe paused for a missing payment method, once a
 * payment method exists. Billing starts immediately (new cycle anchored now):
 * the free trial was already used up, so the first charge is for the plan.
 */
export async function resumePausedTrialIfPayable(
  stripe: Stripe,
  subscriptionId: string,
): Promise<TrialBillingState> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const hasPaymentMethod = await subscriptionHasPaymentMethod(stripe, subscription);

  if (subscription.status !== 'paused' || !hasPaymentMethod) {
    return {
      status: subscription.status,
      hasPaymentMethod,
      trialEnd: isoFromUnix(subscription.trial_end),
      resumed: false,
    };
  }

  const resumed = await stripe.subscriptions.resume(subscriptionId, {
    billing_cycle_anchor: 'now',
    proration_behavior: 'none',
  });
  return {
    status: resumed.status,
    hasPaymentMethod: true,
    trialEnd: isoFromUnix(resumed.trial_end),
    resumed: true,
  };
}

/**
 * Sync the local order row from Stripe after a resume (or any state change).
 * Mirrors the webhook's syncSubscriptionOrderState; duplicated here so the
 * dashboard read path does not import the webhook module.
 */
export async function syncOrderFromSubscription(
  supabase: OrdersClient,
  stripe: Stripe,
  subscriptionId: string,
): Promise<void> {
  const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as Stripe.Subscription & {
    current_period_end?: number | null;
  };
  const { error } = await supabase
    .from('orders')
    .update({
      stripe_customer_id: paymentMethodId(subscription.customer),
      subscription_status: subscription.status,
      current_period_end: isoFromUnix(subscription.current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end,
      ended_at: isoFromUnix(subscription.ended_at),
    })
    .eq('stripe_subscription_id', subscriptionId);
  if (error) {
    console.error(`❌ Failed to sync order for subscription ${subscriptionId}:`, error);
  }
}

/**
 * Roster progress for the trial-ending email: active (unreleased) seat
 * claims on the order and how many of those operators hold a certificate.
 */
export async function trialRosterProgress(
  supabase: OrdersClient,
  orderId: string,
): Promise<{ invited: number; certified: number }> {
  const { data: claims } = await supabase
    .from('seat_claims')
    .select('user_id')
    .eq('order_id', orderId)
    .is('released_at', null);
  const operatorIds: string[] = (claims || []).map((c: any) => c.user_id).filter(Boolean);
  if (!operatorIds.length) return { invited: 0, certified: 0 };

  const { count } = await supabase
    .from('certificates')
    .select('id', { count: 'exact', head: true })
    .in('learner_id', operatorIds);
  return { invited: operatorIds.length, certified: count || 0 };
}

/**
 * Webhook helper: a payment method was attached to (or set as default on)
 * `customerId`. Resume any of that customer's paused GFC trial orders.
 * Returns the subscription ids that were resumed.
 */
export async function resumePausedTrialsForCustomer(
  supabase: OrdersClient,
  stripe: Stripe,
  customerId: string,
): Promise<string[]> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, stripe_subscription_id')
    .eq('stripe_customer_id', customerId)
    .eq('source_brand', 'gfc')
    .eq('subscription_status', 'paused')
    .not('stripe_subscription_id', 'is', null);

  if (error) {
    console.error(`❌ Failed to look up paused trials for customer ${customerId}:`, error);
    return [];
  }

  const resumedIds: string[] = [];
  for (const order of orders || []) {
    const subscriptionId = order.stripe_subscription_id as string;
    try {
      const state = await resumePausedTrialIfPayable(stripe, subscriptionId);
      await syncOrderFromSubscription(supabase, stripe, subscriptionId);
      if (state.resumed) resumedIds.push(subscriptionId);
    } catch (err) {
      console.error(`❌ Failed to resume paused trial ${subscriptionId}:`, err);
    }
  }
  return resumedIds;
}
