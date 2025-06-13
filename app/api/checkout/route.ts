import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;
    const origin = headers().get('origin') || 'http://localhost:3000';

    console.log('📦 Request body:', body);
    console.log('🌐 Origin:', origin);

    // Create line items for the checkout session
    const lineItems = items.map((item: { priceId: string; quantity: number; coreCharge?: number }) => {
      const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
        price: item.priceId,
        quantity: item.quantity,
      };

      // Add core charge as a separate line item if applicable
      if (item.coreCharge) {
        lineItem.price_data = {
          currency: 'usd',
          product_data: {
            name: 'Core Charge',
            description: 'Refundable core charge',
          },
          unit_amount: Math.round(item.coreCharge * 100), // Convert to cents
        };
      }

      return lineItem;
    });

    // Use free shipping for all products
    const shippingRateId = 'shr_1RZdQkHJI548rO8JQOmkLnwc';
    console.log('Using free shipping rate for all products');

    console.log('🛒 Line items:', lineItems);

    // Log all relevant variables before Stripe call
    console.log('DEBUG: About to create Stripe session with:', {
      lineItems,
      shippingRateId,
      origin,
      items,
    });

    // Create the checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      shipping_options: [
        {
          shipping_rate: shippingRateId,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
    };
    console.log('DEBUG: Stripe session config:', JSON.stringify(sessionConfig, null, 2));
    
    try {
      // Verify the shipping rate exists and is active
      const shippingRate = await stripe.shippingRates.retrieve(shippingRateId);
      console.log('DEBUG: Shipping rate details:', {
        id: shippingRate.id,
        active: shippingRate.active,
        display_name: shippingRate.display_name,
        amount: shippingRate.fixed_amount?.amount,
      });

      if (!shippingRate.active) {
        throw new Error(`Shipping rate ${shippingRateId} is not active`);
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);
      console.log('✅ Checkout session created:', session.id);
      return NextResponse.json({ sessionId: session.id });
    } catch (stripeError) {
      console.error('❌ Stripe API error:', {
        message: stripeError instanceof Error ? stripeError.message : 'Unknown error',
        code: (stripeError as any)?.code,
        type: (stripeError as any)?.type,
        raw: (stripeError as any)?.raw,
      });
      throw stripeError;
    }
  } catch (error) {
    console.error('❌ Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 