import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CompSourceId } from './compSources';
import type { MagAvailability } from './magSnapshot';
import { calculateSellPrice, categoryFromPartCategory, type SellPriceResult } from './calculateSellPrice';

export type CompetitorPriceEntry = {
  source: CompSourceId | string;
  price: number;
  url?: string;
  fetched_at: string;
  /** Magnasource on-hand (TVH network). Snapshot only — does not drive is_in_stock. */
  qty_on_hand?: number | null;
  availability?: MagAvailability;
  weight_lb?: number | null;
  /** Struck-through list price when the comp page shows one. */
  list_price?: number | null;
  /** True when the comp caps the count, e.g. "100+ in stock". */
  qty_is_floor?: boolean;
  selling_unit?: string | null;
  /** Comp's own "confirmed by supplier at" stamp — freshness proof for the reading. */
  supplier_confirmed_at?: string | null;
};

/** Per-row state for the Magnasource inventory/sticker watch job. */
export type MagWatchState = {
  last_checked_at: string;
  last_availability: MagAvailability;
  /** Consecutive affirmative sold-out readings. A pull requires 2. */
  sold_out_streak: number;
  /** Consecutive invalid-PN / parse failures. Retires the URL at 3. */
  miss_count: number;
  url?: string | null;
  pulled_at?: string | null;
  pull_reason?: string | null;
  /** Saved so a relist can restore Buy Now exactly. */
  prior_stripe_price_id?: string | null;
  prior_sales_type?: string | null;
};

export async function updatePartStripePrice(
  stripe: Stripe,
  part: {
    name: string;
    description?: string | null;
    sku: string;
    oem_reference?: string | null;
    brand: string;
    stripe_product_id?: string | null;
  },
  sellPrice: number
): Promise<{ stripeProductId: string; stripePriceId: string }> {
  let stripeProductId = part.stripe_product_id;
  if (!stripeProductId) {
    const product = await stripe.products.create({
      name: part.name,
      description: part.description?.slice(0, 500) || undefined,
      metadata: {
        sku: part.sku,
        oem_reference: part.oem_reference ?? part.sku,
        brand: part.brand,
      },
    });
    stripeProductId = product.id;
  }

  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(sellPrice * 100),
    currency: 'usd',
    metadata: { sku: part.sku },
  });

  return { stripeProductId, stripePriceId: stripePrice.id };
}

export function buildCompetitorMetadata(
  existing: Record<string, unknown> | null | undefined,
  entries: CompetitorPriceEntry[],
  pricing: SellPriceResult
): Record<string, unknown> {
  const prev = (existing?.competitor_prices as CompetitorPriceEntry[] | undefined) ?? [];
  const merged = [...prev.filter((p) => !entries.some((e) => e.source === p.source)), ...entries];

  return {
    ...(existing ?? {}),
    competitor_prices: merged,
    last_comp_pricing: {
      at: new Date().toISOString(),
      method: pricing.method,
      comp_discount: pricing.compDiscountUsed ?? null,
      margin_pct: Math.round(pricing.marginPct * 1000) / 10,
      notes: pricing.notes,
    },
  };
}

export async function applyCompPricing(params: {
  stripe: Stripe;
  supabase: SupabaseClient;
  partId: string;
  part: {
    sku: string;
    name: string;
    description?: string | null;
    oem_reference?: string | null;
    brand: string;
    category?: string | null;
    price?: number;
    stripe_product_id?: string | null;
    metadata?: Record<string, unknown> | null;
  };
  cost?: number | null;
  compPrice: number;
  compSource?: CompSourceId | string;
  compUrl?: string;
  compQty?: number | null;
  compAvailability?: CompetitorPriceEntry['availability'];
  compWeightLb?: number | null;
  compDiscount?: number;
  enableBuyNow?: boolean;
  backordered?: boolean;
}): Promise<{ sellPrice: number; pricing: SellPriceResult }> {
  const pricing = calculateSellPrice({
    cost: params.cost,
    compPrice: params.compPrice,
    category: categoryFromPartCategory(params.part.category),
    compDiscount: params.compDiscount,
  });

  const provisional = !(typeof params.cost === 'number' && params.cost > 0);

  const { stripeProductId, stripePriceId } = await updatePartStripePrice(
    params.stripe,
    params.part,
    pricing.sellPrice
  );

  const competitorEntry: CompetitorPriceEntry = {
    source: params.compSource ?? 'magnasource',
    price: params.compPrice,
    url: params.compUrl,
    fetched_at: new Date().toISOString(),
    ...(params.compQty != null ? { qty_on_hand: params.compQty } : {}),
    ...(params.compAvailability ? { availability: params.compAvailability } : {}),
    ...(params.compWeightLb != null ? { weight_lb: params.compWeightLb } : {}),
  };

  const metadata = buildCompetitorMetadata(params.part.metadata, [competitorEntry], pricing);

  const update: Record<string, unknown> = {
    price: pricing.sellPrice,
    price_cents: Math.round(pricing.sellPrice * 100),
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePriceId,
    metadata: {
      ...metadata,
      ...(params.cost != null && params.cost > 0 ? { cost_wholesale: params.cost } : {}),
      ...(provisional
        ? {
            provisional_pricing: true,
            provisional_pricing_note:
              'Sell price set from Magnasource comp — wholesale cost not verified yet.',
          }
        : {
            provisional_pricing: false,
            provisional_pricing_note: null,
          }),
    },
    updated_at: new Date().toISOString(),
  };

  if (params.backordered) {
    update.sales_type = 'quote_only';
    update.is_in_stock = false;
    metadata.backordered = true;
    metadata.availability_note =
      'Backordered — contact us to confirm availability before ordering.';
  } else if (params.enableBuyNow !== false) {
    update.sales_type = 'direct';
    update.is_in_stock = true;
  }

  const { error } = await params.supabase.from('parts').update(update).eq('id', params.partId);
  if (error) throw new Error(error.message);

  return { sellPrice: pricing.sellPrice, pricing };
}
