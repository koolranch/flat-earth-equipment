// Stripe customer portal for training subscriptions (Crew / Facility).
// Lets org owners update payment methods, switch plans, or cancel self-serve.

import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { stripe } from '@/lib/payments/stripeServer';
import { getAuthUser } from '@/lib/supabase/mobile-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { user } = await getAuthUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'auth_required' }, { status: 401 });

  const svc = supabaseService();
  const { data: orders, error } = await svc
    .from('orders')
    .select('id, stripe_customer_id, created_at')
    .eq('user_id', user.id)
    .not('stripe_customer_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const customerId = orders?.[0]?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json({ ok: false, error: 'no_billing_account' }, { status: 404 });
  }

  // GFC trainers manage billing on app.getforkliftcertified.com; return them
  // there instead of the FEE domain (same rule as the add-seats checkout).
  const requestHost = (req.headers.get('host') || '').toLowerCase();
  const base =
    requestHost === 'app.getforkliftcertified.com'
      ? 'https://app.getforkliftcertified.com'
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com').replace(/\/+$/, '');

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${base}/trainer`,
  });

  return NextResponse.json({ ok: true, url: session.url });
}
