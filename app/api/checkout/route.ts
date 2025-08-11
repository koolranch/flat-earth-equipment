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
    const { priceId, slug, qty = 1 } = body || {};
    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }
    const quantity = Math.max(1, Number(qty) || 1);
    const base = siteUrlFrom(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity }],
      allow_promotion_codes: true,
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      success_url: `${base}/thank-you?slug=${encodeURIComponent(slug ?? "")}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/chargers${slug ? `/${encodeURIComponent(slug)}` : ""}`,
      metadata: { slug: slug ?? "" },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (e) {
    console.error("checkout error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}