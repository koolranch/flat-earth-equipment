/**
 * Catalog cap for a part we only have one of. Checkout reads this from the
 * parts row. A quantity on the request is not trusted.
 */

export function qtyMaxFromMetadata(metadata: unknown): number | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null;
  const raw = (metadata as Record<string, unknown>).qty_max;
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

export function qtyExceedsCatalogMax(
  items: Array<{ priceId?: string; quantity?: number; metadata?: unknown }>,
): string | null {
  const totals = new Map<string, { qty: number; max: number }>();
  for (const item of items) {
    const max = qtyMaxFromMetadata(item.metadata);
    if (max == null || typeof item.priceId !== 'string' || !item.priceId) continue;
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const prev = totals.get(item.priceId);
    const nextQty = (prev?.qty ?? 0) + qty;
    const cap = prev ? Math.min(prev.max, max) : max;
    if (nextQty > cap) return `Only ${cap} available.`;
    totals.set(item.priceId, { qty: nextQty, max: cap });
  }
  return null;
}
