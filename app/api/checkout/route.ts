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

      // ── JCB subcategory freight rules ──────────────────────────────
      // Flat-rate shipping for JCB replacement parts by subcategory.
      const jcbFreightMap: Record<string, { amount: number; label: string; desc: string }> = {
        'JCB Filters':            { amount: 1500, label: 'JCB Filters',          desc: 'Flat rate ground shipping for JCB filter elements' },
        'JCB Brakes':             { amount: 3500, label: 'JCB Brake Components', desc: 'Flat rate ground shipping for JCB brake parts' },
        'JCB Electrical':         { amount: 2500, label: 'JCB Electrical Parts', desc: 'Flat rate ground shipping for JCB electrical components' },
        'JCB Switches & Sensors': { amount: 1500, label: 'JCB Switches & Sensors', desc: 'Flat rate ground shipping for JCB sensors and switches' },
        'JCB Seals & Gaskets':    { amount: 1500, label: 'JCB Seals & Gaskets', desc: 'Flat rate ground shipping for JCB seals and gaskets' },
        'JCB Engine Parts':       { amount: 3500, label: 'JCB Engine Parts',    desc: 'Flat rate ground shipping for JCB engine components' },
        'JCB Fuel System':        { amount: 2500, label: 'JCB Fuel System',     desc: 'Flat rate ground shipping for JCB fuel system parts' },
        'JCB Hydraulic Valves':   { amount: 2900, label: 'JCB Hydraulic Valves', desc: 'Flat rate ground shipping for JCB hydraulic valves' },
        'JCB Hydraulics':         { amount: 2900, label: 'JCB Hydraulic Parts', desc: 'Flat rate ground shipping for JCB hydraulic components' },
        'JCB Cooling':            { amount: 2900, label: 'JCB Cooling Parts',   desc: 'Flat rate ground shipping for JCB radiators and coolers' },
        'JCB Cab & Body':         { amount: 2900, label: 'JCB Cab & Body Parts', desc: 'Flat rate ground shipping for JCB cab and body parts' },
        'JCB Controls':           { amount: 2500, label: 'JCB Controls',        desc: 'Flat rate ground shipping for JCB joysticks and controls' },
        'JCB Hoses':              { amount: 2500, label: 'JCB Hoses',           desc: 'Flat rate ground shipping for JCB hoses and fittings' },
        'JCB Pins & Bushings':    { amount: 1500, label: 'JCB Pins & Bushings', desc: 'Flat rate ground shipping for JCB pins and bushings' },
        'JCB Lights':             { amount: 1700, label: 'JCB Lights',          desc: 'Flat rate ground shipping for JCB lights and lamps' },
        'JCB Mirrors':            { amount: 1700, label: 'JCB Mirrors',         desc: 'Flat rate ground shipping for JCB mirrors' },
        'JCB Seats':              { amount: 2500, label: 'JCB Seats',           desc: 'Flat rate ground shipping for JCB seats' },
        'JCB Undercarriage':      { amount: 2900, label: 'JCB Undercarriage',   desc: 'Flat rate ground shipping for JCB undercarriage parts' },
        'JCB Steering':           { amount: 2500, label: 'JCB Steering',        desc: 'Flat rate ground shipping for JCB steering components' },
        'JCB Wheels':             { amount: 2900, label: 'JCB Wheels',          desc: 'Flat rate ground shipping for JCB wheels and rims' },
        'JCB Mounts & Dampers':   { amount: 2500, label: 'JCB Mounts & Dampers', desc: 'Flat rate ground shipping for JCB mounts and dampers' },
        'JCB Exhaust':            { amount: 2900, label: 'JCB Exhaust',         desc: 'Flat rate ground shipping for JCB exhaust parts' },
        'JCB General Parts':      { amount: 2900, label: 'JCB Parts',           desc: 'Flat rate ground shipping for JCB replacement parts' },
      };

      // Apply JCB freight — one charge per distinct JCB subcategory in the cart
      const jcbCategoriesInCart = new Set<string>(
        categories.filter((cat: string) => cat.startsWith('JCB '))
      );
      for (const jcbCat of jcbCategoriesInCart) {
        const rule = jcbFreightMap[jcbCat];
        if (rule) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Freight Shipping - ${rule.label}`,
                description: rule.desc,
              },
              unit_amount: rule.amount,
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

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      ...(referralPromoCodeId
        ? { discounts: [{ promotion_code: referralPromoCodeId }] }
        : { allow_promotion_codes: true }),
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