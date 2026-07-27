/**
 * Map Stripe Checkout Session metadata → orders row attribution fields.
 * Pure helper so the webhook and unit tests share one source of truth.
 */

export type OrderAttributionFields = {
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  funnel_state: string | null;
};

const CLICK_KEYS = ['gclid', 'gbraid', 'wbraid'] as const;

function cleanMetaValue(raw: unknown, maxLen: number): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

/**
 * Extract attribution columns from Stripe session.metadata.
 * Missing / empty keys become null (Postgres-friendly insert).
 */
export function attributionFieldsFromCheckoutMetadata(
  metadata: Record<string, string> | null | undefined,
): OrderAttributionFields {
  const meta = metadata ?? {};
  return {
    gclid: cleanMetaValue(meta.gclid, 200),
    gbraid: cleanMetaValue(meta.gbraid, 200),
    wbraid: cleanMetaValue(meta.wbraid, 200),
    funnel_state: cleanMetaValue(meta.funnel_state, 32)?.toLowerCase() ?? null,
  };
}

/** True when at least one Google click id is present. */
export function hasGoogleClickId(fields: OrderAttributionFields): boolean {
  return Boolean(fields.gclid || fields.gbraid || fields.wbraid);
}

export function pickClickIdsFromRecord(
  source: Record<string, unknown> | null | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!source) return out;
  for (const key of CLICK_KEYS) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      out[key] = value.trim();
    }
  }
  return out;
}
