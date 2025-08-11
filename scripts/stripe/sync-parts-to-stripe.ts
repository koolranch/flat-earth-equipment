/**
 * SAFE SYNC (No-Core) — Supabase -> Stripe
 *
 * Default behavior (SAFE):
 * - DRY_RUN=1 by default (no writes)
 * - DO NOT touch any row that already has stripe_product_id or stripe_price_id
 * - DO NOT update existing Stripe Products or Prices
 * - DO NOT change product.default_price
 *
 * Opt-in flags (explicitly set to "1" to enable):
 * - ALLOW_PRODUCT_UPDATE: update product name/desc/images/metadata if product exists
 * - ALLOW_PRICE_UPDATE: create a NEW price if amount changed
 * - SET_DEFAULT_PRICE: set product.default_price when creating a price (new or updated)
 *
 * Run:
 *   DRY_RUN=1 ts-node scripts/stripe/sync-parts-to-stripe.ts     # audit-like, no writes
 *   DRY_RUN=0 ts-node scripts/stripe/sync-parts-to-stripe.ts     # create missing only
 *   DRY_RUN=0 ALLOW_PRICE_UPDATE=1 SET_DEFAULT_PRICE=1 ts-node scripts/stripe/sync-parts-to-stripe.ts   # (advanced)
 */

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const DRY_RUN = (process.env.DRY_RUN ?? "1") === "1";
const ALLOW_PRODUCT_UPDATE = (process.env.ALLOW_PRODUCT_UPDATE ?? "0") === "1";
const ALLOW_PRICE_UPDATE = (process.env.ALLOW_PRICE_UPDATE ?? "0") === "1";
const SET_DEFAULT_PRICE = (process.env.SET_DEFAULT_PRICE ?? "0") === "1";

const Part = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  brand: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  price: z.string().nullable(),
  price_cents: z.number().nullable(),
  sku: z.string().nullable(),
  category_slug: z.string().nullable(),
  stripe_product_id: z.string().nullable(),
  stripe_price_id: z.string().nullable(),
});
type Part = z.infer<typeof Part>;

function centsFrom(p: Part): number {
  if (p.price_cents && p.price_cents > 0) return p.price_cents;
  if (p.price && p.price.trim() !== "") {
    const n = Math.round(Number(p.price) * 100);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function imgArray(url: string | null) {
  return url && url.trim() ? [url.trim()] : undefined;
}

function metadataFor(p: Part): Record<string, string> {
  return {
    slug: p.slug,
    brand: p.brand ?? "",
    category_slug: p.category_slug ?? "",
    sku: p.sku ?? "",
  };
}

async function createStripeProduct(p: Part) {
  const params: Stripe.ProductCreateParams = {
    name: p.name,
    description: p.description ?? undefined,
    images: imgArray(p.image_url),
    metadata: metadataFor(p),
  };
  if (DRY_RUN) {
    console.log(`[DRY] Create product for ${p.slug}`);
    return "prod_dry_" + p.slug;
  }
  const prod = await stripe.products.create(params);
  return prod.id;
}

async function maybeUpdateStripeProduct(productId: string, p: Part) {
  if (!ALLOW_PRODUCT_UPDATE) return;
  const params: Stripe.ProductUpdateParams = {
    name: p.name,
    description: p.description ?? undefined,
    images: imgArray(p.image_url),
    metadata: metadataFor(p),
  };
  if (DRY_RUN) {
    console.log(`[DRY] Update product ${productId} for ${p.slug}`);
    return;
  }
  await stripe.products.update(productId, params);
}

async function createStripePrice(productId: string, cents: number, setDefault: boolean) {
  if (DRY_RUN) {
    console.log(`[DRY] Create price ${cents} cents for ${productId}${setDefault ? " (will set default_price)" : ""}`);
    return "price_dry_" + productId + "_" + cents;
  }
  const price = await stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: cents,
    active: true,
  });
  if (setDefault) {
    await stripe.products.update(productId, { default_price: price.id });
  }
  return price.id;
}

async function run() {
  const { data, error } = await sb
    .from("parts")
    .select(
      "id,name,slug,brand,description,image_url,price,price_cents,sku,category_slug,stripe_product_id,stripe_price_id"
    )
    .eq("category_slug", "battery-chargers")
    .eq("brand", "FSIP")
    .order("slug", { ascending: true })
    .limit(1000);

  if (error) throw error;

  const parts: Part[] = (data ?? []).map((r) => Part.parse(r));

  let createdProducts = 0;
  let createdPrices = 0;
  let skippedExisting = 0;
  let skippedNoPrice = 0;
  let updatedProducts = 0;
  let updatedPrices = 0;

  for (const p of parts) {
    const cents = centsFrom(p);

    // If either id exists, we default to NO TOUCH to avoid impacting existing Stripe setup.
    if (p.stripe_product_id || p.stripe_price_id) {
      // Optional drift handling
      if (p.stripe_product_id && ALLOW_PRODUCT_UPDATE) {
        await maybeUpdateStripeProduct(p.stripe_product_id, p);
        updatedProducts++;
      }

      if (p.stripe_price_id && ALLOW_PRICE_UPDATE) {
        // Compare amounts; create a new price only if different
        try {
          const existing = await stripe.prices.retrieve(p.stripe_price_id);
          const stripeCents = existing?.unit_amount ?? null;
          if (cents > 0 && stripeCents !== cents) {
            const newPriceId = await createStripePrice(
              (p.stripe_product_id ?? (existing.product as string)),
              cents,
              SET_DEFAULT_PRICE
            );
            if (!DRY_RUN) {
              const { error: upErr } = await sb
                .from("parts")
                .update({ stripe_price_id: newPriceId, price_cents: cents })
                .eq("id", p.id);
              if (upErr) throw upErr;
            }
            updatedPrices++;
          }
        } catch {
          // If bad price id and ALLOW_PRICE_UPDATE is on, create a new one
          if (p.stripe_product_id) {
            if (cents > 0) {
              const newPriceId = await createStripePrice(p.stripe_product_id, cents, SET_DEFAULT_PRICE);
              if (!DRY_RUN) {
                const { error: upErr } = await sb
                  .from("parts")
                  .update({ stripe_price_id: newPriceId, price_cents: cents })
                  .eq("id", p.id);
                if (upErr) throw upErr;
              }
              updatedPrices++;
            } else {
              skippedNoPrice++;
            }
          }
        }
      }

      skippedExisting++;
      continue; // SAFE: do not alter existing linkage by default
    }

    // Only create for brand-new rows with NO stripe_product_id AND NO stripe_price_id
    if (cents <= 0) {
      console.warn(`Skipping ${p.slug} — no price set (cents=${cents})`);
      skippedNoPrice++;
      continue;
    }

    // 1) Create Product
    const productId = await createStripeProduct(p);
    createdProducts++;

    // 2) Create Price (do NOT set default_price unless SET_DEFAULT_PRICE=1)
    const priceId = await createStripePrice(productId, cents, SET_DEFAULT_PRICE);
    createdPrices++;

    // 3) Persist IDs back to Supabase (and normalize price_cents)
    if (!DRY_RUN) {
      const { error: upErr } = await sb
        .from("parts")
        .update({ stripe_product_id: productId, stripe_price_id: priceId, price_cents: cents })
        .eq("id", p.id);
      if (upErr) throw upErr;
    }

    console.log(`Linked ${p.slug} → product=${productId} price=${priceId}`);
  }

  console.log(
    JSON.stringify(
      {
        summary: {
          createdProducts,
          createdPrices,
          updatedProducts: ALLOW_PRODUCT_UPDATE ? updatedProducts : 0,
          updatedPrices: ALLOW_PRICE_UPDATE ? updatedPrices : 0,
          skippedExisting,
          skippedNoPrice,
          dryRun: DRY_RUN,
          allowProductUpdate: ALLOW_PRODUCT_UPDATE,
          allowPriceUpdate: ALLOW_PRICE_UPDATE,
          setDefaultPrice: SET_DEFAULT_PRICE,
        },
      },
      null,
      2
    )
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


