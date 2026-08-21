// Add extra seats ($29 each) to an existing Crew subscription order.
// Creates a one-time Stripe checkout; the webhook increments orders.seats
// via metadata.purchase_type === 'extra_seats' (see app/api/webhooks/stripe).

import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { stripe } from '@/lib/payments/stripeServer';
import { getAuthUser } from '@/lib/supabase/mobile-auth';
import { isSubscriptionOrderActive } from '@/lib/training/orderEntitlements';

export const dynamic = 'force-dynamic';

const MAX_EXTRA_SEATS_PER_PURCHASE = 25;

export async function POST(req: Request) {
  const { user } = await getAuthUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'auth_required' }, { status: 401 });

  const extraSeatPriceId = process.env.TRAINING_EXTRA_SEAT_PRICE_ID;
  if (!extraSeatPriceId) {
    return NextResponse.json({ ok: false, error: 'extra_seat_price_not_configured' }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const orderId = typeof body.order_id === 'string' ? body.order_id : '';
  const quantity = Math.min(
    MAX_EXTRA_SEATS_PER_PURCHASE,
    Math.max(1, parseInt(String(body.quantity ?? '1'), 10) || 1)
  );

  if (!orderId) {
    return NextResponse.json({ ok: false, error: 'order_id_required' }, { status: 400 });
  }

  const svc = supabaseService();
  const { data: order, error } = await svc
    .from('orders')
    .select('id, user_id, seats, is_unlimited, stripe_subscription_id, subscription_status, current_period_end, ended_at')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ ok: false, error: 'order_not_found' }, { status: 404 });
  }
  if (order.is_unlimited) {
    return NextResponse.json({ ok: false, error: 'order_already_unlimited' }, { status: 400 });
  }
  if (!order.stripe_subscription_id || !isSubscriptionOrderActive(order)) {
    return NextResponse.json({ ok: false, error: 'subscription_not_active' }, { status: 400 });
  }

  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com').replace(/\/+$/, '');

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: extraSeatPriceId, quantity }],
    automatic_tax: { enabled: true },
    billing_address_collection: 'required',
    ...(user.email ? { customer_email: user.email } : {}),
    metadata: {
      purchase_type: 'extra_seats',
      target_order_id: order.id,
      seat_quantity: String(quantity),
    },
    success_url: `${base}/trainer/seats?extra_seats=added`,
    cancel_url: `${base}/trainer/seats`,
  });

  return NextResponse.json({ ok: true, url: session.url, session_id: session.id });
}
