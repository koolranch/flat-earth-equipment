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
    const { items, coupon } = body;
    const origin = headers().get('origin') || 'http://localhost:3000';

    console.log('📦 Request body:', body);
    console.log('🌐 Origin:', origin);

    // Check if any items are training products
    const isTrainingProduct = items.some((item: any) => item.isTraining);

    // Create line items for the checkout session
    const lineItems = items.map((item: { 
      priceId: string; 
      quantity: number; 
      coreCharge?: number; 
      isTraining?: boolean;
      metadata?: {
        firmwareVersion?: string;
        moduleId?: string;
        offer?: string;
        [key: string]: any;
      };
      name?: string;
    }) => {
      const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
        price: item.priceId,
        quantity: item.quantity,
      };

      // Store metadata for later processing (will be added to session metadata)

      // Add core charge as a separate line item if applicable
      if (item.coreCharge) {
        // If we already have price_data, we need to add core charge differently
        // For now, keep the existing core charge logic separate
        const coreChargeItem: Stripe.Checkout.SessionCreateParams.LineItem = {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Core Charge',
              description: 'Refundable core charge',
            },
            unit_amount: Math.round(item.coreCharge * 100), // Convert to cents
          },
          quantity: item.quantity,
        };
        return [lineItem, coreChargeItem];
      }

      return lineItem;
    }).flat();

    // Use free shipping for all products
    const shippingRateId = 'shr_1RgEOfHJI548rO8JVTDbw8CD';
    console.log('Using free shipping rate for all products');

    console.log('🛒 Line items:', lineItems);

    // Log all relevant variables before Stripe call
    console.log('DEBUG: About to create Stripe session with:', {
      lineItems,
      shippingRateId,
      origin,
      items,
      coupon
    });

    // Collect metadata from items
    const sessionMetadata: Record<string, string> = {};
    items.forEach((item: any, index: number) => {
      if (item.metadata) {
        Object.keys(item.metadata).forEach(key => {
          sessionMetadata[`item_${index}_${key}`] = String(item.metadata[key]);
        });
      }
    });
    
    // Add course metadata for training products
    if (isTrainingProduct) {
      sessionMetadata.course_slug = 'forklift';
      sessionMetadata.quantity = items[0]?.quantity?.toString() || '1';
      console.log('💰 Training purchase - will auto-create account and enroll');
    }

    // Create the checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode: 'payment',
      success_url: isTrainingProduct 
        ? `${origin}/dashboard-simple?session_id={CHECKOUT_SESSION_ID}`
        : `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      shipping_options: isTrainingProduct ? undefined : [
        {
          shipping_rate: shippingRateId,
        },
      ],
      shipping_address_collection: isTrainingProduct ? undefined : {
        allowed_countries: ['US'],
      },
      // Enable automatic tax calculation only for physical products (with shipping addresses)
      ...((!isTrainingProduct) && {
        automatic_tax: {
          enabled: true,
        },
        customer_update: {
          shipping: 'auto',
        },
      }),
      metadata: sessionMetadata,
      ...(coupon && { discounts: [{ coupon }] }),
      ...(!coupon && { allow_promotion_codes: true })
    };
    console.log('DEBUG: Stripe session config:', JSON.stringify(sessionConfig, null, 2));
    
    try {
      // Verify the shipping rate exists and is active (only for physical products)
      if (!isTrainingProduct) {
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