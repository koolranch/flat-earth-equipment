/**
 * Catalog Add to Cart used to omit category. Checkout then skipped the
 * cab-glass ground line. Fill missing freight facts from the parts row
 * for the Stripe price id the client already sent.
 */

export type CheckoutFreightItem = {
  priceId?: string;
  category?: string;
  price?: number | string;
  metadata?: Record<string, unknown> | null;
};

export type CatalogFreightFacts = {
  category: string | null;
  categorySlug: string | null;
  price: number | null;
  freightCents: number | null;
  freeFreight: boolean;
  costWholesale: number | null;
};

type FreightQuery = {
  data: Array<Record<string, unknown>> | null;
  error: { message: string } | null;
};

type FreightLookupClient = {
  from: (table: 'parts') => {
    select: (columns: string) => {
      in: (column: string, values: string[]) => PromiseLike<FreightQuery>;
    };
  };
};

function asText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asPositiveNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function metadataRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function freightFactsFromRow(row: Record<string, unknown>): CatalogFreightFacts {
  const metadata = metadataRecord(row.metadata);
  const freeRaw = metadata.free_freight;
  return {
    category: asText(row.category),
    categorySlug: asText(row.category_slug),
    price: asPositiveNumber(row.price),
    freightCents: asPositiveNumber(metadata.freight_cents),
    freeFreight: freeRaw === true || freeRaw === 'true',
    costWholesale: asPositiveNumber(metadata.cost_wholesale),
  };
}

/** Copy catalog freight facts onto a checkout item only where the client left them off. */
export function applyCatalogFreightFacts(
  item: CheckoutFreightItem,
  facts: CatalogFreightFacts | undefined,
): void {
  if (!facts) return;

  const catalogIsGlass = facts.category === 'Cab Glass' || facts.categorySlug === 'cab-glass';
  if (catalogIsGlass && facts.category) {
    item.category = facts.category;
  } else if (!asText(item.category) && facts.category) {
    item.category = facts.category;
  }
  if (asPositiveNumber(item.price) == null && facts.price != null) {
    item.price = facts.price;
  }

  const metadata = { ...metadataRecord(item.metadata) };
  if ((catalogIsGlass && facts.categorySlug) || !asText(metadata.category_slug)) {
    if (facts.categorySlug) metadata.category_slug = facts.categorySlug;
  }
  if (catalogIsGlass && !facts.freeFreight) {
    delete metadata.free_freight;
  }
  if (asPositiveNumber(metadata.freight_cents) == null && facts.freightCents != null) {
    metadata.freight_cents = facts.freightCents;
  }
  if (metadata.free_freight == null && facts.freeFreight) {
    metadata.free_freight = true;
  }
  if (asPositiveNumber(metadata.cost_wholesale) == null && facts.costWholesale != null) {
    metadata.cost_wholesale = facts.costWholesale;
  }
  if (Object.keys(metadata).length > 0) {
    item.metadata = metadata;
  }
}

export async function fillCheckoutFreightFromCatalog(
  supabase: FreightLookupClient,
  items: CheckoutFreightItem[],
): Promise<void> {
  const ids = [
    ...new Set(
      items
        .map((item) => item.priceId)
        .filter((id): id is string => typeof id === 'string' && id.startsWith('price_')),
    ),
  ];
  if (ids.length === 0) return;

  let rows: Array<Record<string, unknown>> = [];
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('stripe_price_id, category, category_slug, price, metadata')
      .in('stripe_price_id', ids);
    if (error) {
      console.error('[checkout] freight lookup', error.message);
      return;
    }
    rows = data ?? [];
  } catch (err) {
    console.error('[checkout] freight lookup failed', err);
    return;
  }

  const byPriceId = new Map<string, CatalogFreightFacts>();
  for (const row of rows) {
    const priceId = asText(row.stripe_price_id);
    if (!priceId || byPriceId.has(priceId)) continue;
    byPriceId.set(priceId, freightFactsFromRow(row));
  }

  for (const item of items) {
    if (!item.priceId) continue;
    applyCatalogFreightFacts(item, byPriceId.get(item.priceId));
  }
}
