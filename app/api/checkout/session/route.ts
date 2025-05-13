import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 1) Ensure secret key is set
  const sk = process.env.STRIPE_SECRET_KEY;
  if (!sk) {
    console.error('Missing STRIPE_SECRET_KEY');
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  // 2) Dynamically import Stripe & instantiate
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(sk, { apiVersion: '2025-04-30.basil' });

  try {
    const { priceId, slug } = await request.json();
    const origin = request.headers.get('origin')!;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/parts/${slug}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/parts/${slug}`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Checkout session failed' }, { status: 500 });
  }
} 