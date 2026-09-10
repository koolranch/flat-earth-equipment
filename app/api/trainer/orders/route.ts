import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { getOrderSeatSummary } from '@/lib/training/orderEntitlements';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { stripe } from '@/lib/payments/stripeServer';
import {
  resumePausedTrialIfPayable,
  syncOrderFromSubscription,
  type TrialBillingState,
} from '@/lib/training/trialSubscription.server';

export const dynamic = 'force-dynamic';

async function isStaff(uid: string) {
  const svc = supabaseService();
  const { data } = await svc.from('profiles').select('role').eq('id', uid).maybeSingle();
  return !!data && ['admin', 'trainer'].includes((data as any).role);
}

export async function GET(req: Request) {
  const svc = supabaseService();
  const { user } = await getAuthUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'auth_required' }, { status: 401 });
  if (!(await isStaff(user.id))) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('pageSize') || '50')));

  // Fetch orders for this trainer
  const { data: orders, error } = await svc
    .from('orders')
    .select('id, course_id, course_slug, seats, amount_cents, created_at, is_unlimited, subscription_status, current_period_end, cancel_at_period_end, ended_at, stripe_subscription_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const orderIds = (orders || []).map(o => (o as any).id);
  let seatMap: Record<string, { claimed: number }> = {};

  // Use view if exists, else count seat_claims
  try {
    const { data: viewRows } = await svc.from('v_order_seat_usage').select('order_id, claimed').in('order_id', orderIds);
    if (viewRows) viewRows.forEach((r: any) => { seatMap[r.order_id] = { claimed: Number(r.claimed) || 0 }; });
  } catch {
    const { data: claims } = await svc.from('seat_claims').select('order_id, id').in('order_id', orderIds).is('released_at', null);
    (claims || []).forEach((c: any) => { seatMap[c.order_id] = seatMap[c.order_id] || { claimed: 0 }; seatMap[c.order_id].claimed += 1; });
  }

  // Trial billing state (GFC no-card trials). Only orders currently in a trial
  // or paused after one hit Stripe; paused orders with a freshly added card
  // are resumed here so the dashboard is right the moment the trainer returns
  // from the customer portal, even if the webhook is a few seconds behind.
  const trialState: Record<string, TrialBillingState> = {};
  for (const o of orders || []) {
    const order = o as any;
    if (!order.stripe_subscription_id) continue;
    if (order.subscription_status !== 'trialing' && order.subscription_status !== 'paused') continue;
    try {
      const state = await resumePausedTrialIfPayable(stripe, order.stripe_subscription_id);
      trialState[order.id] = state;
      if (state.resumed || state.status !== order.subscription_status) {
        await syncOrderFromSubscription(svc, stripe, order.stripe_subscription_id);
        order.subscription_status = state.status;
        if (state.resumed) {
          // Resumed just now: treat as active for this response.
          order.ended_at = null;
          order.current_period_end = null;
        }
      }
    } catch (err) {
      console.error(`Trial state lookup failed for order ${order.id}:`, err);
    }
  }

  const rows = (orders || []).map((o: any) => {
    const summary = getOrderSeatSummary(o, seatMap[o.id]?.claimed || 0);
    const trial = trialState[o.id];
    return {
      order_id: o.id,
      course_slug: o.course_slug || 'forklift_operator',
      seats: summary.seats,
      claimed: summary.claimed,
      remaining: summary.remaining,
      seats_label: summary.seatsLabel,
      remaining_label: summary.remainingLabel,
      is_unlimited: summary.isUnlimited,
      active: summary.active,
      // Extra seats can only be added to live subscription orders (Crew).
      can_add_seats: !summary.isUnlimited && summary.active && !!o.stripe_subscription_id,
      cancel_at_period_end: !!o.cancel_at_period_end,
      current_period_end: o.current_period_end || null,
      subscription_status: o.subscription_status || null,
      // Present only while trialing / paused-after-trial (see above).
      trial: trial
        ? {
            status: trial.status,
            has_payment_method: trial.hasPaymentMethod,
            trial_end: trial.trialEnd,
            resumed: trial.resumed,
          }
        : null,
      amount_cents: o.amount_cents || 0,
      created_at: o.created_at
    };
  });

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const paged = rows.slice(start, start + pageSize);
  const res = NextResponse.json({ ok: true, items: paged, total, page, pageSize });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
