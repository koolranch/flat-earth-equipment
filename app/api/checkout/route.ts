// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

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

    // Referral code lookup — only for training purchases
    let referralPromoCodeId: string | null = null;
    const referralCode = body.referral_code as string | undefined;
    if (referralCode && body.items?.some((item: any) => item.isTraining)) {
      const { data: refCode } = await supabaseService()
        .from('referral_codes')
        .select('stripe_promotion_code_id')
        .eq('code', referralCode.toUpperCase())
        .single();
      if (refCode?.stripe_promotion_code_id) {
        referralPromoCodeId = refCode.stripe_promotion_code_id;
      }
    }

    // [feature-flag: ENABLE_ASK_EMPLOYER_CHECKOUT]
    // When on, extract request_id and prefill_email from the request body.
    // request_id is appended to Stripe metadata; prefill_email becomes customer_email
    // ONLY when the existing flow has not already set one (it currently never does).
    // On any error inside this block, we log and fall through to the legacy path.
    // When the flag is off (or unset), this entire block is skipped and behavior is
    // byte-identical to the pre-feature code.
    let askEmployerRequestId: string | null = null;
    let askEmployerPrefillEmail: string | null = null;
    if (process.env.ENABLE_ASK_EMPLOYER_CHECKOUT === '1') {
      try {
        const requestId = typeof body.request_id === 'string' ? body.request_id.trim() : '';
        const prefillEmail =
          typeof body.prefill_email === 'string' ? body.prefill_email.trim() : '';
        if (requestId) askEmployerRequestId = requestId;
        if (prefillEmail) askEmployerPrefillEmail = prefillEmail;
      } catch (err) {
        console.error('[ask-employer-checkout] error extracting params:', err);
      }
    }

    // Handle both simple checkout (BuyNowButton) and cart checkout (cart page)
    let lineItems = [];
    let metadata: Record<string, string> = {};
    let successSlug = "";
    let checkoutMode: "payment" | "subscription" = "payment";
    
    if (body.items && Array.isArray(body.items)) {
      // Cart checkout format: { items: [{ priceId, quantity, metadata, coreCharge, isTraining, ... }] }
      for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i];
        if (!item.priceId || typeof item.priceId !== "string") {
          return NextResponse.json({ error: `Missing priceId for item ${i}` }, { status: 400 });
        }
        
        const itemCheckoutMode =
          item.isTraining && item.metadata?.checkout_mode === 'subscription'
            ? 'subscription'
            : 'payment';

        if (itemCheckoutMode === 'subscription') {
          if (body.items.length !== 1) {
            return NextResponse.json(
              { error: 'Subscription checkout only supports a single training plan at a time' },
              { status: 400 }
            );
          }
          if (item.coreCharge && Number(item.coreCharge) > 0) {
            return NextResponse.json(
              { error: 'Subscription checkout does not support additional line items' },
              { status: 400 }
            );
          }
          checkoutMode = 'subscription';
        }

        // Add main product line item
        lineItems.push({
          price: item.priceId,
          quantity: Math.max(1, Number(item.quantity) || 1)
        });
        
        // If this is a training purchase, add course_slug and quantity for webhook
        if (item.isTraining) {
          metadata.course_slug = 'forklift';
          metadata.price_id = item.priceId;
          metadata.checkout_mode = itemCheckoutMode;
          // Use seat_count from metadata if provided, otherwise use quantity
          metadata.quantity = String(item.metadata?.seat_count || item.quantity || 1);
          if (item.metadata?.is_unlimited !== undefined) {
            metadata.is_unlimited = String(item.metadata.is_unlimited);
          }
          if (item.metadata?.plan_id) {
            metadata.plan_id = String(item.metadata.plan_id);
          }
          if (item.metadata?.billing_label) {
            metadata.billing_label = String(item.metadata.billing_label);
          }
          // Add funnel state if provided (for Vercel Analytics)
          if (item.metadata?.utm_state) {
            metadata.funnel_state = String(item.metadata.utm_state);
          }
          if (referralCode) {
            metadata.referral_code = referralCode.toUpperCase();
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
            unit_amount: 35000 // $350.00 in cents
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

      // Check for hydraulic cylinders
      if (categories.includes('Hydraulic Cylinders')) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Freight Shipping - Hydraulic Components',
              description: 'Flat rate ground shipping for hydraulic cylinders'
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

      // ── JCB cost-based freight tiers ──────────────────────────────
      // Freight is determined by the part's sell price, matching vendor tiers.
      // Each JCB item (not free_freight) gets its own freight line based on price.
      const jcbItems = body.items.filter((item: any) =>
        !item.metadata?.free_freight &&
        (item.category === 'JCB Parts' || (item.category && typeof item.category === 'string' && item.category.startsWith('JCB ')))
      );

      if (jcbItems.length > 0) {
        function jcbFreightCents(priceDollars: number): number {
          if (priceDollars < 25)   return 1700;  // $17.00
          if (priceDollars < 150)  return 2400;  // $24.00
          if (priceDollars < 300)  return 2900;  // $29.00
          if (priceDollars < 500)  return 3500;  // $35.00
          if (priceDollars < 650)  return 3900;  // $39.00
          return 4900; // $49.00 for $650+
        }

        let totalJcbFreight = 0;
        for (const item of jcbItems) {
          const itemPrice = Number(item.price) || 0;
          const qty = Math.max(1, Number(item.quantity) || 1);
          totalJcbFreight += jcbFreightCents(itemPrice) * qty;
        }

        if (totalJcbFreight > 0) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Freight Shipping - JCB Parts',
                description: 'Ground shipping for JCB replacement parts',
              },
              unit_amount: totalJcbFreight,
            },
            quantity: 1,
          });
        }
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

    // [feature-flag: ENABLE_ASK_EMPLOYER_CHECKOUT]
    // Append request_id to metadata and optionally set customer_email.
    // Existing metadata keys are preserved; nothing is overridden.
    // customer_email is only set from prefill_email because the legacy flow never
    // sets it — if that changes in future, add a prior-set check here.
    let askEmployerCustomerEmail: string | undefined;
    if (process.env.ENABLE_ASK_EMPLOYER_CHECKOUT === '1') {
      try {
        if (askEmployerRequestId) {
          metadata.request_id = askEmployerRequestId;
        }
        if (askEmployerPrefillEmail) {
          // customer_email is not set anywhere in the existing flow, so it is safe
          // to assign directly. If you later set customer_email from the authed user
          // above this block, add a guard: `if (!alreadySetCustomerEmail)`.
          askEmployerCustomerEmail = askEmployerPrefillEmail;
        }
      } catch (err) {
        console.error('[ask-employer-checkout] error applying to session args:', err);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: checkoutMode,
      line_items: lineItems,
      ...(referralPromoCodeId
        ? { discounts: [{ promotion_code: referralPromoCodeId }] }
        : { allow_promotion_codes: true }),
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      ...(checkoutMode === 'subscription'
        ? {
            subscription_data: {
              metadata,
            },
          }
        : {}),
      ...(askEmployerCustomerEmail ? { customer_email: askEmployerCustomerEmail } : {}),
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