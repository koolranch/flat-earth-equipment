/**
 * Seat-assembly freight rule (vendor cost basis):
 * - cost >= $650 → free freight (vendor prepaid)
 * - cost < $650 → $25 flat-rate seat freight at checkout
 * - explicit metadata.free_freight wins when set
 *
 * Seat cushions / covers keep their own checkout freight bands.
 */

export const SEAT_FREE_FREIGHT_COST_USD = 650;

export function getWholesaleCostUsd(
  metadata?: Record<string, unknown> | null
): number | null {
  if (!metadata) return null;
  const raw = metadata.cost_wholesale ?? metadata.vendor_cost ?? metadata.cost;
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function isSeatAssemblyCategory(category?: string | null): boolean {
  return category === 'Seats';
}

/**
 * Whether a seat assembly should skip the $25 seat freight line.
 */
export function qualifiesForSeatFreeFreight(
  category?: string | null,
  metadata?: Record<string, unknown> | null
): boolean {
  if (!isSeatAssemblyCategory(category)) return false;
  if (metadata?.free_freight === true || metadata?.free_freight === 'true') {
    return true;
  }
  const cost = getWholesaleCostUsd(metadata);
  return cost != null && cost >= SEAT_FREE_FREIGHT_COST_USD;
}
