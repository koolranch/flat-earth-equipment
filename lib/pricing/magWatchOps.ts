/**
 * The two write operations the inventory watch performs, shared by the CLI
 * (`scripts/pricing/mag-watch-apply.ts`) and the `/parts-watch` dashboard.
 *
 * Pull — take a sold-out SKU off Buy Now. Flipping `sales_type` alone does not stop a sale:
 * `/api/checkout` trusts a client-supplied `priceId` and never reads the parts row, so a
 * persisted cart or leaked price id still completes. A pull therefore does four things
 * together: `sales_type → quote_only`, `is_in_stock → false`, Stripe price archived, and
 * `stripe_price_id → null` with the prior id saved to `metadata.mag_watch`.
 *
 * Relist — the reverse, only for rows this job pulled (it needs the saved prior price id).
 *
 * Eligibility is pure and separated from IO so both callers enforce exactly the same gate
 * and it can be tested without Stripe or Supabase. Every successful write lands an audit row
 * in `parts_ops_audit`; the audit insert failing never rolls back the operation, but is
 * reported so it is visible.
 *
 * Never touches Stripe webhooks, checkout, freight, training or certification.
 */

import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isSoldOutReading, type MagAvailability } from './magSnapshot';
import {
  classifyRow,
  isBuyNow,
  isSkip,
  soldOutStreak,
  SOLD_OUT_STREAK_TO_PULL,
  WATCH_ROW_SELECT,
  type WatchRow,
} from './magWatchUniverse';

/** A reading older than this is too stale to act on. */
export const MAX_READING_AGE_DAYS = 3;

export type OpsSource = 'cli' | 'dashboard';
export type OpsAction = 'pull' | 'relist';

export type MagWatchMeta = {
  last_checked_at?: string;
  last_availability?: MagAvailability;
  sold_out_streak?: number;
  pulled_at?: string | null;
  pull_reason?: string | null;
  prior_stripe_price_id?: string | null;
  prior_sales_type?: string | null;
  relisted_at?: string | null;
};

export function watchMeta(row: WatchRow): MagWatchMeta {
  const raw = row.metadata?.mag_watch;
  return raw && typeof raw === 'object' ? (raw as MagWatchMeta) : {};
}

function ageDays(iso: string | undefined, nowMs: number): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return Number.POSITIVE_INFINITY;
  return (nowMs - then) / 86_400_000;
}

// ---------------------------------------------------------------------------
// Eligibility (pure)
// ---------------------------------------------------------------------------

export type PullPlan = {
  row: WatchRow;
  availability: MagAvailability;
  streak: number;
  readingAgeDays: number;
};

export type PullEligibility =
  | { ok: true; plan: PullPlan }
  | { ok: false; why: string; /** true when it is sold out but not yet confirmed/fresh */ watching: boolean };

export function pullEligibility(row: WatchRow, now = new Date()): PullEligibility {
  if (!isBuyNow(row)) return { ok: false, why: 'not a live Buy Now row', watching: false };
  if (isSkip(classifyRow(row))) return { ok: false, why: 'row is outside the watch scope', watching: false };

  const meta = watchMeta(row);
  const availability = meta.last_availability;
  if (!availability || !isSoldOutReading(availability)) {
    return { ok: false, why: 'latest vendor reading is not sold out', watching: false };
  }

  const streak = soldOutStreak(row);
  const readingAgeDays = ageDays(meta.last_checked_at, now.getTime());

  if (streak < SOLD_OUT_STREAK_TO_PULL) {
    return {
      ok: false,
      why: `streak ${streak}/${SOLD_OUT_STREAK_TO_PULL} — needs one more confirming read`,
      watching: true,
    };
  }
  if (readingAgeDays > MAX_READING_AGE_DAYS) {
    return {
      ok: false,
      why: `reading is ${readingAgeDays.toFixed(1)} days old — re-run mag-watch first`,
      watching: true,
    };
  }

  return { ok: true, plan: { row, availability, streak, readingAgeDays } };
}

export type RelistEligibility =
  | { ok: true; priorPriceId: string; priorSalesType: string }
  | { ok: false; why: string };

export function relistEligibility(row: WatchRow): RelistEligibility {
  const meta = watchMeta(row);
  if (!meta.pulled_at) return { ok: false, why: 'row is not currently pulled' };
  const priorPriceId = meta.prior_stripe_price_id;
  if (!priorPriceId) {
    return {
      ok: false,
      why: 'no mag_watch.prior_stripe_price_id — it was not pulled by this job. Relist by hand.',
    };
  }
  if (isBuyNow(row)) return { ok: false, why: 'row is already Buy Now' };
  return { ok: true, priorPriceId, priorSalesType: meta.prior_sales_type ?? 'direct' };
}

// ---------------------------------------------------------------------------
// Metadata shapes (pure)
// ---------------------------------------------------------------------------

export const PULLED_AVAILABILITY_NOTE =
  'Currently unavailable — contact us to confirm availability before ordering.';

export function pulledMetadata(
  row: WatchRow,
  plan: PullPlan,
  archivedPriceId: string | null,
  now = new Date()
): Record<string, unknown> {
  const prev = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    ...prev,
    availability_note: PULLED_AVAILABILITY_NOTE,
    mag_watch: {
      ...watchMeta(row),
      pulled_at: now.toISOString(),
      pull_reason: `magnasource ${plan.availability} on ${plan.streak} consecutive reads`,
      prior_stripe_price_id: archivedPriceId ?? row.stripe_price_id ?? null,
      prior_sales_type: row.sales_type ?? 'direct',
    },
  };
}

export function relistedMetadata(row: WatchRow, now = new Date()): Record<string, unknown> {
  const next = { ...(row.metadata ?? {}) } as Record<string, unknown>;
  delete next.availability_note;
  next.mag_watch = {
    ...watchMeta(row),
    pulled_at: null,
    pull_reason: null,
    prior_stripe_price_id: null,
    prior_sales_type: null,
    sold_out_streak: 0,
    relisted_at: now.toISOString(),
  };
  return next;
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export type AuditEntry = {
  source: OpsSource;
  action: OpsAction;
  sku: string;
  part_id: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  stripe: Record<string, unknown> | null;
  note: string | null;
};

/** The columns worth keeping for a before/after diff. Metadata is large; keep only mag_watch. */
export function auditSnapshot(row: Pick<WatchRow, 'sales_type' | 'is_in_stock' | 'stripe_price_id' | 'price' | 'metadata'>) {
  return {
    sales_type: row.sales_type,
    is_in_stock: row.is_in_stock,
    stripe_price_id: row.stripe_price_id,
    price: row.price,
    mag_watch: (row.metadata as Record<string, unknown> | null)?.mag_watch ?? null,
  };
}

async function writeAudit(supabase: SupabaseClient, entry: AuditEntry): Promise<string | null> {
  const { error } = await supabase.from('parts_ops_audit').insert(entry);
  return error ? error.message : null;
}

// ---------------------------------------------------------------------------
// IO
// ---------------------------------------------------------------------------

export type OpResult = { ok: boolean; note: string; auditError?: string | null };

export async function fetchWatchRowBySku(supabase: SupabaseClient, sku: string): Promise<WatchRow | null> {
  const { data, error } = await supabase
    .from('parts')
    .select(WATCH_ROW_SELECT)
    .eq('sku', sku)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as WatchRow | null) ?? null;
}

/**
 * Confirm the Stripe price really belongs to this catalog row before archiving it. Guards
 * against a stale or mismatched id pointing at some unrelated product.
 */
export async function verifyPriceOwnership(
  stripe: Stripe,
  row: WatchRow
): Promise<{ ok: true; price: Stripe.Price } | { ok: false; why: string }> {
  if (!row.stripe_price_id) return { ok: false, why: 'row has no stripe_price_id' };

  let price: Stripe.Price;
  try {
    price = await stripe.prices.retrieve(row.stripe_price_id, { expand: ['product'] });
  } catch (e) {
    return { ok: false, why: `stripe retrieve failed: ${(e as Error).message.slice(0, 60)}` };
  }

  if (price.unit_amount !== row.price_cents) {
    return { ok: false, why: `unit_amount ${price.unit_amount} != price_cents ${row.price_cents}` };
  }

  const product = price.product;
  const productSku =
    typeof product === 'object' && product && 'metadata' in product
      ? (product.metadata as Record<string, string> | null)?.sku
      : undefined;
  const priceSku = (price.metadata as Record<string, string> | null)?.sku;

  if (priceSku !== row.sku && productSku !== row.sku) {
    return { ok: false, why: `neither price nor product metadata.sku matches ${row.sku}` };
  }

  return { ok: true, price };
}

export async function pullSoldOut(
  stripe: Stripe,
  supabase: SupabaseClient,
  plan: PullPlan,
  opts: { dryRun: boolean; source: OpsSource; note?: string }
): Promise<OpResult> {
  const { row } = plan;
  const before = auditSnapshot(row);
  const verified = await verifyPriceOwnership(stripe, row);

  if (!verified.ok) {
    // Still take it off Buy Now, but leave Stripe alone and say so loudly.
    if (opts.dryRun) {
      return { ok: true, note: `would set quote_only, Stripe price left active — ${verified.why}` };
    }
    const metadata = pulledMetadata(row, plan, null);
    const patch = {
      sales_type: 'quote_only',
      is_in_stock: false,
      metadata,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('parts').update(patch).eq('id', row.id);
    if (error) return { ok: false, note: `db update failed: ${error.message}` };
    const auditError = await writeAudit(supabase, {
      source: opts.source,
      action: 'pull',
      sku: row.sku,
      part_id: row.id,
      before,
      after: auditSnapshot({ ...row, ...patch, stripe_price_id: row.stripe_price_id }),
      stripe: { archived: null, ownership: verified.why },
      note: opts.note ?? null,
    });
    return {
      ok: true,
      note: `quote_only set, Stripe price left active — ${verified.why}. Check this one by hand.`,
      auditError,
    };
  }

  if (opts.dryRun) {
    return { ok: true, note: `would archive ${verified.price.id} and set quote_only` };
  }

  await stripe.prices.update(verified.price.id, { active: false });

  const metadata = pulledMetadata(row, plan, verified.price.id);
  const patch = {
    sales_type: 'quote_only',
    is_in_stock: false,
    stripe_price_id: null,
    metadata,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('parts').update(patch).eq('id', row.id);

  if (error) {
    // Put the price back rather than leaving Stripe and Supabase disagreeing.
    await stripe.prices.update(verified.price.id, { active: true });
    return { ok: false, note: `db update failed, Stripe price restored: ${error.message}` };
  }

  const auditError = await writeAudit(supabase, {
    source: opts.source,
    action: 'pull',
    sku: row.sku,
    part_id: row.id,
    before,
    after: auditSnapshot({ ...row, ...patch }),
    stripe: { archived: verified.price.id },
    note: opts.note ?? null,
  });

  return { ok: true, note: `archived ${verified.price.id}, set quote_only`, auditError };
}

export async function relist(
  stripe: Stripe,
  supabase: SupabaseClient,
  row: WatchRow,
  opts: { dryRun: boolean; source: OpsSource; note?: string }
): Promise<OpResult> {
  const eligibility = relistEligibility(row);
  if (!eligibility.ok) return { ok: false, note: eligibility.why };
  const { priorPriceId, priorSalesType } = eligibility;

  if (opts.dryRun) {
    return { ok: true, note: `would restore ${priorPriceId} and set ${priorSalesType}` };
  }

  const before = auditSnapshot(row);
  await stripe.prices.update(priorPriceId, { active: true });

  const patch = {
    sales_type: priorSalesType,
    is_in_stock: true,
    stripe_price_id: priorPriceId,
    metadata: relistedMetadata(row),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('parts').update(patch).eq('id', row.id);
  if (error) {
    // Undo the Stripe side so a shopper cannot buy a price the row does not carry.
    await stripe.prices.update(priorPriceId, { active: false });
    return { ok: false, note: `db update failed, Stripe price re-archived: ${error.message}` };
  }

  const auditError = await writeAudit(supabase, {
    source: opts.source,
    action: 'relist',
    sku: row.sku,
    part_id: row.id,
    before,
    after: auditSnapshot({ ...row, ...patch }),
    stripe: { restored: priorPriceId },
    note: opts.note ?? null,
  });

  return { ok: true, note: `restored ${priorPriceId}, set ${priorSalesType}`, auditError };
}
