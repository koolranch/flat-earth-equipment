/**
 * Cab-glass ground freight.
 *
 * The $18 / $25 / $31 / $37 / $41 bands follow the glass sell subtotal.
 * Prepaid ground starts only when wholesale cost is at least $650.
 * A high sell price with no cost on file stays on the $41 band.
 * Heavier screens use an explicit freight_cents override.
 */

import { getWholesaleCostUsd } from './seatFreight';

export const CAB_GLASS_PREPAID_COST_USD = 650;

export function cabGlassFreightCents(sellDollars: number): number {
  if (!(sellDollars > 0)) return 0;
  if (sellDollars < 25) return 1800;
  if (sellDollars < 150) return 2500;
  if (sellDollars < 300) return 3100;
  if (sellDollars < 500) return 3700;
  return 4100;
}

export function cabGlassOrderFreightCents(params: {
  sellDollars: number;
  /** Wholesale cost for the glass lines. Null when any line has no cost. */
  costDollars: number | null;
}): number {
  if (params.costDollars != null && params.costDollars >= CAB_GLASS_PREPAID_COST_USD) return 0;
  return cabGlassFreightCents(params.sellDollars);
}

/** Sum of wholesale cost × qty. Null when any line is missing a cost. */
export function cabGlassLinesCostDollars(
  lines: Array<{ quantity?: number | null; metadata?: Record<string, unknown> | null }>,
): number | null {
  if (lines.length === 0) return null;
  let sum = 0;
  for (const line of lines) {
    const cost = getWholesaleCostUsd(line.metadata);
    if (cost == null) return null;
    sum += cost * Math.max(1, Number(line.quantity) || 1);
  }
  return sum;
}

export function isCabGlassCheckoutItem(item: {
  category?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  return item.category === 'Cab Glass' || item.metadata?.category_slug === 'cab-glass';
}
