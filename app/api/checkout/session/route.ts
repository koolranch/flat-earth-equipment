import { NextResponse } from 'next/server';
import Stripe from 'stripe';

type LineItem = 
  | { price: string; quantity: number }
  | {
      price_data: {
        currency: string;
        product_data: {
          name: string;
        };
        unit_amount: number;
      };
      quantity: number;
    };

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
    const { product, slug } = await request.json();
    const origin = request.headers.get('origin')!;

    // Build line items array
    const lineItems: LineItem[] = [
      {
        price: product.stripe_price_id,
        quantity: 1
      }
    ];

    // Add core charge if applicable
    if (product.has_core_charge && product.core_charge) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${product.name} – Core Charge`
          },
          unit_amount: Math.round(product.core_charge * 100)
        },
        quantity: 1
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/parts/${slug}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/parts/${slug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Checkout session failed' }, { status: 500 });
  }
} 