import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation
    const required = ["name", "email", "product_name", "product_slug"];
    const missing = required.filter((k) => !body[k] || String(body[k]).trim() === "");
    if (missing.length) {
      return NextResponse.json({ ok: false, error: `Missing: ${missing.join(", ")}` }, { status: 400 });
    }

    // Build payload
    const payload = {
      name: String(body.name),
      email: String(body.email),
      company: String(body.company || ""),
      phone: String(body.phone || ""),
      quantity: String(body.quantity || "1"),
      urgency: String(body.urgency || ""),
      notes: String(body.notes || ""),
      product_name: String(body.product_name),
      product_slug: String(body.product_slug),
      product_sku: String(body.product_sku || ""),
      timestamp: new Date().toISOString(),
      source: "chargers-landing",
    };

    const endpoint = process.env.FORMSPREE_ENDPOINT;

    if (endpoint) {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const text = await resp.text();
        console.error("Formspree error:", resp.status, text);
        return NextResponse.json({ ok: false, error: "Upstream error" }, { status: 502 });
      }
    } else {
      // Fallback: log on server for now
      console.log("QUOTE REQUEST (no FORMSPREE_ENDPOINT set):", payload);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("quote-charger error", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}


