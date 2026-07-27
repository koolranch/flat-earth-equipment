/**
 * GA4 helpers for the charger-modules revenue program.
 * Additive only — does not change checkout/webhook behavior.
 */

import { trackEvent } from '@/lib/analytics/gtag';
import { CHARGER_MODULES } from '@/constants/chargerOptions';

export const CHARGER_MODULE_PRICE_IDS = new Set(
  CHARGER_MODULES.flatMap((m) => m.offers.map((o) => o.sku))
);

export function isChargerModulePriceId(priceId: string | null | undefined): boolean {
  return !!priceId && CHARGER_MODULE_PRICE_IDS.has(priceId);
}

export function trackChargerViewItem(params: {
  slug: string;
  brand: string;
  partNumber: string;
  priceCents: number;
  offer?: string;
}) {
  trackEvent('view_item', {
    item_list_name: 'charger_modules',
    currency: 'USD',
    value: params.priceCents / 100,
    items: [
      {
        item_id: params.slug,
        item_name: `${params.brand} ${params.partNumber}`,
        item_brand: params.brand,
        item_category: 'Charger Modules',
        item_variant: params.offer || 'Reman Exchange',
        price: params.priceCents / 100,
        quantity: 1,
      },
    ],
  });
  trackEvent('charger_module_view', {
    slug: params.slug,
    brand: params.brand,
    part_number: params.partNumber,
  });
}

export function trackChargerAddToCart(params: {
  slug?: string;
  brand?: string;
  partNumber?: string;
  priceId: string;
  priceCents: number;
  offer: string;
  moduleId?: string;
}) {
  trackEvent('add_to_cart', {
    currency: 'USD',
    value: params.priceCents / 100,
    items: [
      {
        item_id: params.slug || params.priceId,
        item_name: params.partNumber
          ? `${params.brand || ''} ${params.partNumber}`.trim()
          : `Charger Module (${params.offer})`,
        item_brand: params.brand,
        item_category: 'Charger Modules',
        item_variant: params.offer,
        price: params.priceCents / 100,
        quantity: 1,
      },
    ],
  });
  trackEvent('charger_module_add_to_cart', {
    slug: params.slug,
    brand: params.brand,
    part_number: params.partNumber,
    offer: params.offer,
    price_id: params.priceId,
    module_id: params.moduleId,
  });
}

export function trackChargerBeginCheckout(params: {
  value: number;
  items: Array<{
    priceId: string;
    name: string;
    price: number;
    quantity: number;
    offer?: string;
    slug?: string;
  }>;
}) {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value: params.value,
    item_list_name: 'charger_modules',
    items: params.items.map((item) => ({
      item_id: item.slug || item.priceId,
      item_name: item.name,
      item_category: 'Charger Modules',
      item_variant: item.offer,
      price: item.price,
      quantity: item.quantity,
    })),
  });
  trackEvent('charger_module_begin_checkout', {
    value: params.value,
    item_count: params.items.length,
    price_ids: params.items.map((i) => i.priceId).join(','),
  });
}

export function trackChargerFleetQuoteOpen(params: {
  slug: string;
  sku?: string | null;
  name: string;
}) {
  trackEvent('generate_lead', {
    currency: 'USD',
    lead_type: 'charger_modules_fleet_quote',
    item_list_name: 'charger_modules',
    slug: params.slug,
    sku: params.sku || undefined,
    item_name: params.name,
  });
  trackEvent('charger_module_fleet_quote_open', {
    slug: params.slug,
    sku: params.sku || undefined,
  });
}
