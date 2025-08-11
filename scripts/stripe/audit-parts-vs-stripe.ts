/**
 * Audit FSIP GREEN chargers between Supabase and Stripe (NO WRITES).
 * - Lists rows missing stripe_product_id / stripe_price_id
 * - Verifies existing stripe_price_id amount vs Supabase price/price_cents
 * - Never updates Stripe or Supabase
 *
 * Run:
 *   ts-node scripts/stripe/audit-parts-vs-stripe.ts
 */

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

type Part = {
  id: string;
  name: string;
  slug: string;
  price: string | null;
  price_cents: number | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  brand: string | null;
  category_slug: string | null;
};

function centsFrom(p: Part): number {
  if (p.price_cents && p.price_cents > 0) return p.price_cents;
  if (p.price && p.price.trim() !== "") {
    const n = Math.round(Number(p.price) * 100);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

(async () => {
  const { data, error } = await sb
    .from("parts")
    .select("id,name,slug,price,price_cents,stripe_product_id,stripe_price_id,brand,category_slug")
    .eq("category_slug", "battery-chargers")
    .eq("brand", "FSIP")
    .order("slug", { ascending: true })
    .limit(1000);

  if (error) throw error;

  const parts = (data ?? []) as Part[];

  const report = {
    total: parts.length,
    missingProductId: [] as string[],
    missingPriceId: [] as string[],
    priceMismatch: [] as { slug: string; stripe: number | null; supabase: number }[],
  };

  for (const p of parts) {
    const cents = centsFrom(p);

    if (!p.stripe_product_id) report.missingProductId.push(p.slug);
    if (!p.stripe_price_id) report.missingPriceId.push(p.slug);

    if (p.stripe_price_id) {
      try {
        const price = await stripe.prices.retrieve(p.stripe_price_id);
        const stripeCents = price?.unit_amount ?? null;
        if (cents > 0 && stripeCents !== cents) {
          report.priceMismatch.push({ slug: p.slug, stripe: stripeCents, supabase: cents });
        }
      } catch (e) {
        // Treat as mismatch if ID invalid
        report.priceMismatch.push({ slug: p.slug, stripe: null, supabase: cents });
      }
    }
  }

  console.log("AUDIT REPORT");
  console.log(JSON.stringify(report, null, 2));
})();


