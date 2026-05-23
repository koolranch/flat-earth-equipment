import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CompSourceId } from './compSources';
import { calculateSellPrice, categoryFromPartCategory, type SellPriceResult } from './calculateSellPrice';

export type CompetitorPriceEntry = {
  source: CompSourceId | string;
  price: number;
  url?: string;
  fetched_at: string;
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
        : {}),
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
