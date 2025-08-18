// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function siteUrlFrom(req: NextRequest) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/+$/ , "");
  const origin = req.headers.get("origin") ?? "";
  return origin.replace(/\/+$/ , "") || "http://localhost:3000";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Handle both simple checkout (BuyNowButton) and cart checkout (cart page)
    let lineItems = [];
    let metadata = {};
    let successSlug = "";
    
    if (body.items && Array.isArray(body.items)) {
      // Cart checkout format: { items: [{ priceId, quantity, metadata, ... }] }
      for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i];
        if (!item.priceId || typeof item.priceId !== "string") {
          return NextResponse.json({ error: `Missing priceId for item ${i}` }, { status: 400 });
        }
        lineItems.push({
          price: item.priceId,
          quantity: Math.max(1, Number(item.quantity) || 1)
        });
        
        // Store metadata for each item
        if (item.metadata) {
          Object.keys(item.metadata).forEach(key => {
            metadata[`item_${i}_${key}`] = item.metadata[key];
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

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      success_url: `${base}/checkout/success?slug=${encodeURIComponent(successSlug)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/cart`,
      metadata: metadata,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (e) {
    console.error("checkout error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}