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

  // 2) Initialize Stripe
  const stripe = new Stripe(sk, { apiVersion: '2025-04-30.basil' });

  try {
    // 3) Parse request body
    const body = await request.json();
    console.log('📦 Request body:', body);
    
    const { priceId, coreCharge } = body;
    if (!priceId) {
      console.error('Missing priceId in request body');
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    // 4) Get origin for success/cancel URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    console.log('🌐 Origin:', origin);

    // 5) Build line items
    const lineItems: LineItem[] = [
      {
        price: priceId,
        quantity: 1
      }
    ];

    // Add core charge if provided
    if (coreCharge) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Core Charge'
          },
          unit_amount: Math.round(coreCharge * 100)
        },
        quantity: 1
      });
    }

    console.log('🛒 Line items:', lineItems);

    // 6) Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      automatic_tax: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA']
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'usd',
            },
            display_name: 'Free Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
      ],
    });

    console.log('✅ Checkout session created:', session.id);

    // 7) Return session ID
    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error('❌ Stripe checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 