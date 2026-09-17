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
import {
  calculateSellPrice,
  categoryFromPartCategory,
  type SellPriceResult,
} from './calculateSellPrice';
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
export type OpsAction = 'pull' | 'relist' | 'reprice';

/**
 * Above this multiple of the vendor sticker, a no-cost row is more likely a wrong item, a
 * pack-vs-each mismatch, or a channel we do not buy from than a real overprice. Those need a
 * human look at the part, not a price cut.
 */
export const REPRICE_VERIFY_ABOVE_MULTIPLE = 1.5;

/**
 * A raise this large on a no-cost row is the mirror image: our seed price may have been for
 * a different part. Raising cannot lose money, but listing a $16 switch at $539 is still wrong.
 */
export const REPRICE_VERIFY_RAISE_MULTIPLE = 3;

/**
 * Operator lock. `parts.metadata.reprice_hold = { reason }` keeps the Apply button off a row
 * regardless of what the vendor reads — for judgment SKUs (unique high-ticket PNs priced
 * against OEM, not Mag; live joysticks we have decided not to cut).
 */
export function repriceHold(row: WatchRow): string | null {
  const hold = row.metadata?.reprice_hold;
  if (!hold || typeof hold !== 'object') return null;
  const reason = (hold as Record<string, unknown>).reason;
  return typeof reason === 'string' && reason.trim() ? reason.trim() : 'operator hold';
}

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
// Reprice eligibility (pure)
// ---------------------------------------------------------------------------

export type RepricePlan = {
  row: WatchRow;
  ourSell: number;
  magPrice: number;
  cost: number | null;
  proposedSell: number;
  /** Positive = we lower the price, negative = we raise it. */
  deltaDollars: number;
  marginPct: number | null;
  method: string;
  notes: string[];
};

export type RepriceEligibility =
  /** Button shows; server will apply `plan.proposedSell`. */
  | { kind: 'apply'; plan: RepricePlan }
  /** No button. Row is fine or the change is not worth a Stripe price. */
  | { kind: 'skip'; why: string }
  /** No button. Proposal would not clear our cost — needs a cost/PO decision, not a click. */
  | { kind: 'hold'; why: string; plan: RepricePlan }
  /** No button. Gap is so large the reading is suspect — verify the item first. */
  | { kind: 'verify'; why: string; plan: RepricePlan };

function magReading(row: WatchRow): {
  price: number | null;
  availability: MagAvailability | null;
  fetchedAt: string | null;
  weightLb: number | null;
} {
  const comps = row.metadata?.competitor_prices;
  const entry = Array.isArray(comps)
    ? (comps.find(
        (c) => c && typeof c === 'object' && (c as Record<string, unknown>).source === 'magnasource'
      ) as Record<string, unknown> | undefined)
    : undefined;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return {
    price: num(entry?.price),
    availability: (entry?.availability as MagAvailability | undefined) ?? null,
    fetchedAt: typeof entry?.fetched_at === 'string' ? entry.fetched_at : null,
    weightLb: num(entry?.weight_lb),
  };
}

/** Minimum change before a new Stripe price is worth creating. */
const MIN_REPRICE_DELTA_DOLLARS = 1;

export function repriceEligibility(
  row: WatchRow,
  opts: { skipOems?: Set<string>; now?: Date } = {}
): RepriceEligibility {
  const now = opts.now ?? new Date();
  if (!isBuyNow(row)) return { kind: 'skip', why: 'not a live Buy Now row' };
  if (isSkip(classifyRow(row))) return { kind: 'skip', why: 'outside the watch scope' };
  if (opts.skipOems?.has(row.oem_reference ?? '')) return { kind: 'skip', why: 'on the skip-comps list' };

  const ourSell = Number(row.price ?? 0);
  if (!(ourSell > 0)) return { kind: 'skip', why: 'no sell price' };
  if (!row.stripe_product_id) return { kind: 'skip', why: 'no Stripe product on the row' };

  const mag = magReading(row);
  if (mag.price === null) return { kind: 'skip', why: 'no vendor sticker on file' };
  if (mag.availability !== 'in_stock' && mag.availability !== 'limited') {
    return { kind: 'skip', why: `vendor reads ${mag.availability ?? 'unknown'} — pull, do not reprice` };
  }
  const age = ageDays(mag.fetchedAt ?? undefined, now.getTime());
  if (age > MAX_READING_AGE_DAYS) {
    return { kind: 'skip', why: `vendor reading is ${age.toFixed(1)} days old` };
  }
  if ((mag.weightLb ?? 0) >= 75) return { kind: 'skip', why: 'LTL weight — freight-quoted, not matrix priced' };

  const costRaw = row.metadata?.cost_wholesale;
  const cost =
    typeof costRaw === 'number' && costRaw > 0
      ? costRaw
      : typeof costRaw === 'string' && Number(costRaw) > 0
        ? Number(costRaw)
        : null;

  let result: SellPriceResult;
  try {
    result = calculateSellPrice({
      cost,
      compPrice: mag.price,
      category: categoryFromPartCategory(row.category),
    });
  } catch (e) {
    return { kind: 'skip', why: (e as Error).message };
  }

  const plan: RepricePlan = {
    row,
    ourSell,
    magPrice: mag.price,
    cost,
    proposedSell: result.sellPrice,
    deltaDollars: Math.round((ourSell - result.sellPrice) * 100) / 100,
    marginPct: cost === null ? null : Math.round(result.marginPct * 1000) / 10,
    method: result.method,
    notes: result.notes,
  };

  if (Math.abs(plan.deltaDollars) < MIN_REPRICE_DELTA_DOLLARS) {
    return { kind: 'skip', why: 'already at the proposed price' };
  }

  const locked = repriceHold(row);
  if (locked) return { kind: 'hold', why: locked, plan };

  // With a real cost: the calculator already applied the margin floor, so a cut to the floor
  // is safe even when it lands above the vendor. The one case to hold is a vendor sticker at
  // or under our cost — that is a cost reset or a different item, not a price to chase.
  if (cost !== null) {
    if (mag.price <= cost) {
      return { kind: 'hold', why: `vendor sticker $${mag.price} is at/under our cost $${cost} — confirm cost on next PO`, plan };
    }
    if (result.sellPrice <= cost) return { kind: 'hold', why: 'proposal would not clear cost', plan };
    return { kind: 'apply', plan };
  }

  // No cost on file: only trust a modest gap in either direction. A huge gap means verify the
  // part, not move the price.
  if (ourSell > mag.price * REPRICE_VERIFY_ABOVE_MULTIPLE) {
    return {
      kind: 'verify',
      why: `we are ${(ourSell / mag.price).toFixed(1)}× the vendor sticker — confirm it is the same item`,
      plan,
    };
  }
  if (result.sellPrice > ourSell * REPRICE_VERIFY_RAISE_MULTIPLE) {
    return {
      kind: 'verify',
      why: `proposal is ${(result.sellPrice / ourSell).toFixed(1)}× our price — confirm it is the same item before raising`,
      plan,
    };
  }
  return { kind: 'apply', plan };
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

/**
 * Apply a reprice plan: new Stripe price on the existing product, archive the old price,
 * update the row, audit. If the row update fails, the new price is archived and the old one
 * reactivated so the live `stripe_price_id` always points at an active price.
 */
export async function applyReprice(
  stripe: Stripe,
  supabase: SupabaseClient,
  plan: RepricePlan,
  opts: { dryRun: boolean; source: OpsSource; note?: string }
): Promise<OpResult> {
  const { row } = plan;
  if (!row.stripe_product_id) return { ok: false, note: 'row has no stripe_product_id' };

  if (opts.dryRun) {
    return {
      ok: true,
      note: `would price $${plan.ourSell} → $${plan.proposedSell} (Mag $${plan.magPrice})`,
    };
  }

  const before = auditSnapshot(row);
  const newPrice = await stripe.prices.create({
    product: row.stripe_product_id,
    unit_amount: Math.round(plan.proposedSell * 100),
    currency: 'usd',
    metadata: {
      sku: row.sku,
      previous_price_cents: String(row.price_cents ?? Math.round(plan.ourSell * 100)),
      reason: plan.cost === null ? 'mag_realign_no_cost' : 'mag_realign_with_cost',
    },
  });

  const prev = (row.metadata ?? {}) as Record<string, unknown>;
  const patch = {
    price: plan.proposedSell,
    price_cents: Math.round(plan.proposedSell * 100),
    stripe_price_id: newPrice.id,
    metadata: {
      ...prev,
      ...(plan.cost === null
        ? {
            provisional_pricing: true,
            provisional_pricing_note:
              'Sell price realigned to the vendor sticker — wholesale cost not verified yet.',
          }
        : { provisional_pricing: false, provisional_pricing_note: null }),
      last_comp_pricing: {
        at: new Date().toISOString(),
        method: plan.method,
        comp_discount: 0.05,
        margin_pct: plan.marginPct,
        notes: [
          ...plan.notes,
          `Realigned $${plan.ourSell} → $${plan.proposedSell} against Mag $${plan.magPrice}${plan.cost === null ? ' (no cost on file)' : ` · cost $${plan.cost}`}`,
        ],
      },
    },
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('parts').update(patch).eq('id', row.id);
  if (error) {
    await stripe.prices.update(newPrice.id, { active: false });
    return { ok: false, note: `db update failed, new price archived: ${error.message}` };
  }

  if (row.stripe_price_id && row.stripe_price_id !== newPrice.id) {
    try {
      await stripe.prices.update(row.stripe_price_id, { active: false });
    } catch (e) {
      // Row already points at the new price; an un-archived old one is harmless but worth noting.
      return {
        ok: true,
        note: `priced $${plan.ourSell} → $${plan.proposedSell}; old price ${row.stripe_price_id} could not be archived: ${(e as Error).message.slice(0, 60)}`,
      };
    }
  }

  const auditError = await writeAudit(supabase, {
    source: opts.source,
    action: 'reprice',
    sku: row.sku,
    part_id: row.id,
    before,
    after: auditSnapshot({ ...row, ...patch }),
    stripe: { created: newPrice.id, archived: row.stripe_price_id, mag_price: plan.magPrice },
    note: opts.note ?? null,
  });

  return {
    ok: true,
    note: `priced $${plan.ourSell} → $${plan.proposedSell} (Mag $${plan.magPrice}), ${newPrice.id}`,
    auditError,
  };
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
