/**
 * Core deposits are dollars on `parts.core_charge`. Checkout must add that
 * deposit even when a Buy Now button only sends the Stripe price id.
 */
export type CoreChargeSource = {
  has_core_charge?: boolean | null;
  core_charge?: number | string | null;
};

export type CatalogedCore = {
  cents: number;
  sku: string | null;
  name: string | null;
};

export function coreChargeCents(row: CoreChargeSource | null | undefined): number {
  if (!row || row.has_core_charge !== true) return 0;
  const dollars = typeof row.core_charge === 'number' ? row.core_charge : Number(row.core_charge);
  if (!Number.isFinite(dollars) || dollars <= 0) return 0;
  return Math.round(dollars * 100);
}

export function clientCoreCents(clientDollars: unknown): number {
  const dollars = typeof clientDollars === 'number' ? clientDollars : Number(clientDollars);
  if (!Number.isFinite(dollars) || dollars <= 0) return 0;
  return Math.round(dollars * 100);
}

/** Database core wins. A missing catalog row falls back to the amount the client sent. */
export function resolveCheckoutCoreCents(
  cataloged: CatalogedCore | undefined,
  clientDollars: unknown,
): number {
  if (cataloged && cataloged.cents > 0) return cataloged.cents;
  return clientCoreCents(clientDollars);
}

type CoreLookupClient = {
  from: (table: 'parts' | 'part_variants') => {
    select: (columns: string) => {
      in: (
        column: string,
        values: string[],
      ) => PromiseLike<{
        data: Array<Record<string, unknown>> | null;
        error: { message: string } | null;
      }>;
    };
  };
};

function asText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

export async function loadCoreByPriceId(
  supabase: CoreLookupClient,
  priceIds: Array<string | null | undefined>,
): Promise<Map<string, CatalogedCore>> {
  const ids = [
    ...new Set(
      priceIds.filter((id): id is string => typeof id === 'string' && id.startsWith('price_')),
    ),
  ];
  const map = new Map<string, CatalogedCore>();
  if (ids.length === 0) return map;

  const [partsRes, variantsRes] = await Promise.all([
    supabase
      .from('parts')
      .select('sku, name, stripe_price_id, has_core_charge, core_charge')
      .in('stripe_price_id', ids),
    supabase
      .from('part_variants')
      .select('stripe_price_id, has_core_charge, core_charge')
      .in('stripe_price_id', ids),
  ]);

  if (partsRes.error) {
    console.error('[checkout] core lookup parts', partsRes.error.message);
  }
  if (variantsRes.error) {
    console.error('[checkout] core lookup variants', variantsRes.error.message);
  }

  for (const row of partsRes.data ?? []) {
    const priceId = asText(row.stripe_price_id);
    const cents = coreChargeCents(row as CoreChargeSource);
    if (!priceId || cents <= 0) continue;
    map.set(priceId, {
      cents,
      sku: asText(row.sku),
      name: asText(row.name),
    });
  }

  for (const row of variantsRes.data ?? []) {
    const priceId = asText(row.stripe_price_id);
    const cents = coreChargeCents(row as CoreChargeSource);
    if (!priceId || cents <= 0 || map.has(priceId)) continue;
    map.set(priceId, { cents, sku: null, name: null });
  }

  return map;
}
