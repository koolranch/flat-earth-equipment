/**
 * Client GA4 events for parts browsing and quote leads.
 * Does not call checkout, Stripe, or the webhook.
 */

import { isChargerModulePriceId } from '@/lib/analytics/charger-modules';
import { trackEvent } from '@/lib/analytics/gtag';

export type PartsFunnelItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category: 'parts';
};

export type QuoteLeadParams = {
  form_id: string;
  page_path: string;
  value: 0;
  currency: 'USD';
};

type CartLine = {
  category?: string;
  stripe_price_id?: string;
  metadata?: { moduleId?: string } | null;
};

function roundMoney(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

export function isPartsCartLine(item: CartLine): boolean {
  if (item.category === 'Charger Modules') return false;
  if (item.metadata?.moduleId) return false;
  if (isChargerModulePriceId(item.stripe_price_id)) return false;
  return true;
}

/** Charger-module fleet quotes already emit generate_lead when the modal opens. */
export function quoteLeadAlreadyTracked(product: {
  slug?: string | null;
  sku?: string | null;
}): boolean {
  const slug = product.slug || '';
  return (
    slug === 'charger-modules-fleet' ||
    slug.startsWith('charger-modules') ||
    product.sku === 'FLEET-CHARGERS'
  );
}

export function partsFunnelItem(input: {
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
}): PartsFunnelItem {
  const itemId = input.itemId.trim() || 'part';
  const quantity = Math.max(1, Math.round(input.quantity) || 1);
  return {
    item_id: itemId,
    item_name: input.itemName.trim() || itemId,
    price: roundMoney(input.price),
    quantity,
    item_category: 'parts',
  };
}

export function partsEventPayload(items: PartsFunnelItem[]) {
  const value = roundMoney(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  return {
    currency: 'USD' as const,
    value,
    items,
  };
}

export function quoteLeadParams(formId: string, pagePath: string): QuoteLeadParams {
  return {
    form_id: formId,
    page_path: pagePath,
    value: 0,
    currency: 'USD',
  };
}

export function trackPartsViewItem(item: PartsFunnelItem) {
  trackEvent('view_item', partsEventPayload([item]));
}

export function trackPartsAddToCart(item: PartsFunnelItem) {
  trackEvent('add_to_cart', partsEventPayload([item]));
}

export function trackPartsBeginCheckout(items: PartsFunnelItem[]) {
  if (items.length === 0) return;
  trackEvent('begin_checkout', partsEventPayload(items));
}

export function trackQuoteLead(formId: string) {
  const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
  trackEvent('generate_lead', quoteLeadParams(formId, pagePath));
}
