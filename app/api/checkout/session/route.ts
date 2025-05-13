import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dotenvFlow from 'dotenv-flow';

dotenvFlow.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: Request) {
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