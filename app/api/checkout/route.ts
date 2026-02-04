// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function gaOpen() { return process.env.FEATURE_GA === '1'; }

function siteUrlFrom(req: NextRequest) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/+$/ , "");
  const origin = req.headers.get("origin") ?? "";
  return origin.replace(/\/+$/ , "") || "http://localhost:3000";
}

export async function POST(req: NextRequest) {
  if (!gaOpen()) {
    // allow staff to test while GA is off
    const { data: { user } } = await supabaseServer().auth.getUser();
    const isStaff = !!user && (await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/is-staff', { headers: { cookie: req.headers.get('cookie')||'' } })).ok;
    if (!isStaff) return new Response(JSON.stringify({ ok:false, error:'not_open' }), { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    
    // Handle both simple checkout (BuyNowButton) and cart checkout (cart page)
    let lineItems = [];
    let metadata: Record<string, string> = {};
    let successSlug = "";
    
    if (body.items && Array.isArray(body.items)) {
      // Cart checkout format: { items: [{ priceId, quantity, metadata, coreCharge, isTraining, ... }] }
      for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i];
        if (!item.priceId || typeof item.priceId !== "string") {
          return NextResponse.json({ error: `Missing priceId for item ${i}` }, { status: 400 });
        }
        
        // Add main product line item
        lineItems.push({
          price: item.priceId,
          quantity: Math.max(1, Number(item.quantity) || 1)
        });
        
        // If this is a training purchase, add course_slug and quantity for webhook
        if (item.isTraining) {
          metadata.course_slug = 'forklift';
          // Use seat_count from metadata if provided, otherwise use quantity
          metadata.quantity = String(item.metadata?.seat_count || item.quantity || 1);
          // Add funnel state if provided (for Vercel Analytics)
          if (item.metadata?.utm_state) {
            metadata.funnel_state = String(item.metadata.utm_state);
          }
        }
        
        // Add core charge as separate line item if applicable
        if (item.coreCharge && Number(item.coreCharge) > 0) {
          // Create a one-time price for the core charge
          const coreChargeAmount = Math.round(Number(item.coreCharge) * 100); // Convert to cents
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Core Charge - ${item.name || 'Charger Module'}`,
                description: 'Refundable core deposit - refunded when old unit is returned'
              },
              unit_amount: coreChargeAmount
            },
            quantity: Math.max(1, Number(item.quantity) || 1)
          });
        }
        
        // Store metadata for each item
        if (item.metadata) {
          Object.keys(item.metadata).forEach(key => {
            metadata[`item_${i}_${key}`] = String(item.metadata[key]);
          });
        }
      }
      
      // Add freight charges - flat rate per category type (after all items processed)
      // Only include categories from items that don't have free freight
      const categories = body.items
        .filter((item: any) => !item.metadata?.free_freight)
        .map((item: any) => item.category)
        .filter(Boolean);
      
      // Check for fork categories (all fork types get one $250 charge)
      const hasForks = categories.some((cat: string) => 
        cat === 'forks' || 
        cat === 'Class II Forks' || 
        cat === 'Class III Forks' || 
        cat === 'Class IV Forks'
      );
      if (hasForks) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Freight Shipping - Forklift Forks',
              description: 'Freight shipping for forklift forks due to size and weight'
            },
            unit_amount: 25000 // $250.00 in cents
          },
          quantity: 1
        });
      }
      
      // Check for carpet/rug rams
      if (categories.includes('Rug / Carpet Rams')) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Freight Shipping - Carpet/Rug Rams',
              description: 'Freight shipping for carpet poles due to size and weight'
            },
            unit_amount: 100000 // $1,000.00 in cents
          },
          quantity: 1
        });
      }

      // Check for mirrors
      if (categories.includes('Mirrors')) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Freight Shipping - Equipment Mirrors',
              description: 'Flat rate ground shipping for machine mirrors'
            },
            unit_amount: 1700 // $17.00 in cents
          },
          quantity: 1
        });
      }

      // Check for brakes
      if (categories.includes('Brakes')) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Freight Shipping - Heavy Brake Components',
              description: 'Flat rate ground shipping for heavy brake parts'
            },
            unit_amount: 3500 // $35.00 in cents
          },
          quantity: 1
        });
      }

      // Check for seat cushions
      if (categories.includes('Seat cushions')) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Freight Shipping - Seat Cushions',
              description: 'Flat rate ground shipping for seat components'
            },
            unit_amount: 2900 // $29.00 in cents
          },
          quantity: 1
        });
      }

      // Check for seat covers
      if (categories.includes('Seat covers')) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Freight Shipping - Seat Covers',
              description: 'Flat rate ground shipping for seat covers'
            },
            unit_amount: 2900 // $29.00 in cents
          },
          quantity: 1
        });
      }

      // Check for undercarriage
      if (categories.includes('Undercarriage')) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Freight Shipping - Undercarriage Components',
              description: 'Flat rate ground shipping for heavy undercarriage parts'
            },
            unit_amount: 2900 // $29.00 in cents
          },
          quantity: 1
        });
      }

      // Check for full seats
      if (categories.includes('Seats')) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Freight Shipping - Equipment Seats',
              description: 'Flat rate ground shipping for heavy equipment seats'
            },
            unit_amount: 2500 // $25.00 in cents
          },
          quantity: 1
        });
      }

      // Check for steering rod ends
      if (categories.includes('Steering rod ends')) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Freight Shipping - Steering Components',
              description: 'Flat rate ground shipping for steering components'
            },
            unit_amount: 2500 // $25.00 in cents
          },
          quantity: 1
        });
      }
      
      successSlug = body.items[0]?.name || "";
    } else {
      // Simple checkout format: { priceId, slug, qty }
      const { priceId, slug, qty = 1 } = body;
      if (!priceId || typeof priceId !== "string") {
        return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
      }
      lineItems.push({
        price: priceId,
        quantity: Math.max(1, Number(qty) || 1)
      });
      metadata = { slug: slug ?? "" };
      successSlug = slug ?? "";
    }

    const base = siteUrlFrom(req);
    
    // For training purchases, return to /safety on cancel instead of /cart
    const isTrainingPurchase = metadata.course_slug === 'forklift';
    const cancelUrl = isTrainingPurchase ? `${base}/safety#pricing` : `${base}/cart`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      success_url: `${base}/checkout/success?slug=${encodeURIComponent(successSlug)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: metadata,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (e) {
    console.error("checkout error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}