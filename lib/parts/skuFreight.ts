/**
 * Per-SKU `freight_cents` overrides.
 *
 * Ground is charged once per cart line (qty 1). Two of the same small-parcel
 * SKU still ship as one package. Set `freight_per_unit` on heavy / LTL
 * overrides (e.g. lift cylinders) when each unit needs its own freight line.
 */

export type SkuFreightItem = {
  category?: string | null;
  quantity?: number | null;
  metadata?: Record<string, unknown> | null;
};

function isTruthyFlag(value: unknown): boolean {
  return value === true || value === 'true';
}

/** Charge `freight_cents` once per line (qty 1), not per unit. */
export function isFlatSkuFreight(item: SkuFreightItem): boolean {
  const metadata = item.metadata ?? {};
  return !isTruthyFlag(metadata.freight_per_unit);
}

/** Stripe freight line quantity for a `freight_cents` override. */
export function skuFreightQuantity(item: SkuFreightItem): number {
  if (isFlatSkuFreight(item)) return 1;
  return Math.max(1, Number(item.quantity) || 1);
}

/** Dollar amount for a `freight_cents` override, or 0 when unset. */
export function skuFreightDollars(item: SkuFreightItem): number {
  const freightCents = Number(item.metadata?.freight_cents);
  if (!Number.isFinite(freightCents) || freightCents <= 0) return 0;
  return (freightCents / 100) * skuFreightQuantity(item);
}
