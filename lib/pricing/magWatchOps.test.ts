import assert from 'node:assert/strict';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  applyReprice,
  auditSnapshot,
  pullEligibility,
  pullSoldOut,
  pulledMetadata,
  relist,
  relistEligibility,
  relistedMetadata,
  repriceEligibility,
  PULLED_AVAILABILITY_NOTE,
  type AuditEntry,
} from './magWatchOps';
import type { WatchRow } from './magWatchUniverse';

const NOW = new Date('2026-09-17T16:00:00.000Z');
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString();

let n = 0;
function row(over: Partial<WatchRow> & { magWatch?: Record<string, unknown> } = {}): WatchRow {
  n++;
  const { magWatch, ...rest } = over;
  return {
    id: `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`,
    sku: `SKU${n}`,
    slug: `slug-${n}`,
    name: `Part ${n}`,
    brand: 'JCB',
    category: 'Construction Equipment Parts',
    category_slug: 'construction-equipment-parts',
    sales_type: 'direct',
    is_in_stock: true,
    price: 500,
    price_cents: 50000,
    oem_reference: `333/D${1000 + n}`,
    stripe_price_id: 'price_live',
    stripe_product_id: 'prod_live',
    image_url: null,
    metadata: magWatch ? { mag_watch: magWatch } : {},
    ...rest,
  };
}

/** A row carrying a fresh Magnasource read, the shape the snapshot pass writes. */
function pricedRow(opts: {
  ourSell: number;
  mag: number;
  cost?: number;
  availability?: string;
  ageHours?: number;
  weightLb?: number;
  category?: string;
  name?: string;
  oem?: string;
  stripeProductId?: string | null;
}): WatchRow {
  return row({
    price: opts.ourSell,
    price_cents: Math.round(opts.ourSell * 100),
    ...(opts.category !== undefined ? { category: opts.category } : {}),
    ...(opts.name !== undefined ? { name: opts.name } : {}),
    ...(opts.oem !== undefined ? { oem_reference: opts.oem } : {}),
    stripe_product_id: opts.stripeProductId === undefined ? 'prod_live' : opts.stripeProductId,
    metadata: {
      ...(opts.cost !== undefined ? { cost_wholesale: opts.cost } : {}),
      competitor_prices: [
        {
          source: 'magnasource',
          price: opts.mag,
          availability: opts.availability ?? 'in_stock',
          fetched_at: hoursAgo(opts.ageHours ?? 6),
          weight_lb: opts.weightLb ?? null,
        },
      ],
    },
  });
}

// ---------------------------------------------------------------------------
// pullEligibility
// ---------------------------------------------------------------------------
{
  const ok = pullEligibility(
    row({ magWatch: { last_availability: 'backorder', sold_out_streak: 2, last_checked_at: hoursAgo(6) } }),
    NOW
  );
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.plan.streak, 2);
    assert.equal(ok.plan.availability, 'backorder');
  }

  const oneRead = pullEligibility(
    row({ magWatch: { last_availability: 'backorder', sold_out_streak: 1, last_checked_at: hoursAgo(6) } }),
    NOW
  );
  assert.equal(oneRead.ok, false);
  if (!oneRead.ok) {
    assert.equal(oneRead.watching, true);
    assert.match(oneRead.why, /needs one more confirming read/);
  }

  const stale = pullEligibility(
    row({ magWatch: { last_availability: 'special_order', sold_out_streak: 3, last_checked_at: hoursAgo(24 * 4) } }),
    NOW
  );
  assert.equal(stale.ok, false);
  if (!stale.ok) {
    assert.equal(stale.watching, true);
    assert.match(stale.why, /days old/);
  }

  // Limited / 1 on hand is never a pull, no matter the streak.
  const limited = pullEligibility(
    row({ magWatch: { last_availability: 'limited', sold_out_streak: 5, last_checked_at: hoursAgo(1) } }),
    NOW
  );
  assert.equal(limited.ok, false);
  if (!limited.ok) assert.equal(limited.watching, false);

  // Quote-only rows are not pull targets.
  const quote = pullEligibility(
    row({
      sales_type: 'quote_only',
      price: 0,
      magWatch: { last_availability: 'backorder', sold_out_streak: 2, last_checked_at: hoursAgo(1) },
    }),
    NOW
  );
  assert.equal(quote.ok, false);

  // Out-of-scope category (rubber tracks) is never pulled by this job.
  const track = pullEligibility(
    row({
      brand: 'Bobcat',
      category_slug: 'rubber-tracks',
      magWatch: { last_availability: 'backorder', sold_out_streak: 2, last_checked_at: hoursAgo(1) },
    }),
    NOW
  );
  assert.equal(track.ok, false);
}

// ---------------------------------------------------------------------------
// relistEligibility
// ---------------------------------------------------------------------------
{
  const ok = relistEligibility(
    row({
      sales_type: 'quote_only',
      stripe_price_id: null,
      magWatch: { pulled_at: hoursAgo(48), prior_stripe_price_id: 'price_old', prior_sales_type: 'direct' },
    })
  );
  assert.deepEqual(ok, { ok: true, priorPriceId: 'price_old', priorSalesType: 'direct' });

  const notPulled = relistEligibility(row({ sales_type: 'quote_only', stripe_price_id: null }));
  assert.equal(notPulled.ok, false);

  const byHand = relistEligibility(
    row({ sales_type: 'quote_only', stripe_price_id: null, magWatch: { pulled_at: hoursAgo(1) } })
  );
  assert.equal(byHand.ok, false);
  if (!byHand.ok) assert.match(byHand.why, /Relist by hand/);

  const alreadyLive = relistEligibility(
    row({ magWatch: { pulled_at: hoursAgo(1), prior_stripe_price_id: 'price_old' } })
  );
  assert.equal(alreadyLive.ok, false);
}

// ---------------------------------------------------------------------------
// metadata shapes
// ---------------------------------------------------------------------------
{
  const r = row({
    metadata: { cost_wholesale: 300, mag_watch: { last_availability: 'backorder', sold_out_streak: 2, hero: { x: 1 } } },
  });
  const pulled = pulledMetadata(
    r,
    { row: r, availability: 'backorder', streak: 2, readingAgeDays: 0.2 },
    'price_archived',
    NOW
  );
  assert.equal(pulled.cost_wholesale, 300, 'unrelated metadata survives');
  assert.equal(pulled.availability_note, PULLED_AVAILABILITY_NOTE);
  const mw = pulled.mag_watch as Record<string, unknown>;
  assert.equal(mw.prior_stripe_price_id, 'price_archived');
  assert.equal(mw.prior_sales_type, 'direct');
  assert.equal(mw.pulled_at, NOW.toISOString());
  assert.deepEqual(mw.hero, { x: 1 }, 'hero facts survive a pull');
  assert.match(String(mw.pull_reason), /backorder on 2 consecutive reads/);

  const relisted = relistedMetadata({ ...r, metadata: pulled }, NOW);
  assert.equal('availability_note' in relisted, false);
  const mw2 = relisted.mag_watch as Record<string, unknown>;
  assert.equal(mw2.pulled_at, null);
  assert.equal(mw2.prior_stripe_price_id, null);
  assert.equal(mw2.sold_out_streak, 0);
  assert.equal(mw2.relisted_at, NOW.toISOString());
  assert.deepEqual(mw2.hero, { x: 1 });
}

// ---------------------------------------------------------------------------
// IO with stubs: Stripe + Supabase + audit
// ---------------------------------------------------------------------------
type Call = {
  kind: 'stripe.retrieve' | 'stripe.update' | 'stripe.create' | 'parts.update' | 'audit.insert';
  args: unknown;
};

function stubs(opts: {
  priceSku?: string;
  unitAmount?: number;
  retrieveFails?: boolean;
  partsUpdateError?: string;
  auditError?: string;
}) {
  const calls: Call[] = [];
  const stripe = {
    prices: {
      retrieve: async (id: string) => {
        calls.push({ kind: 'stripe.retrieve', args: id });
        if (opts.retrieveFails) throw new Error('No such price');
        return {
          id,
          unit_amount: opts.unitAmount ?? 50000,
          metadata: { sku: opts.priceSku ?? 'MATCH' },
          product: { metadata: {} },
        } as unknown as Stripe.Price;
      },
      update: async (id: string, params: unknown) => {
        calls.push({ kind: 'stripe.update', args: { id, params } });
        return { id } as Stripe.Price;
      },
      create: async (params: unknown) => {
        calls.push({ kind: 'stripe.create', args: params });
        return { id: 'price_new' } as Stripe.Price;
      },
    },
  } as unknown as Stripe;

  const supabase = {
    from: (table: string) => ({
      update: (patch: unknown) => ({
        eq: async () => {
          calls.push({ kind: 'parts.update', args: { table, patch } });
          return { error: opts.partsUpdateError ? { message: opts.partsUpdateError } : null };
        },
      }),
      insert: async (entry: unknown) => {
        calls.push({ kind: 'audit.insert', args: { table, entry } });
        return { error: opts.auditError ? { message: opts.auditError } : null };
      },
    }),
  } as unknown as SupabaseClient;

  return { stripe, supabase, calls };
}

const plan = (r: WatchRow) => ({ row: r, availability: 'backorder' as const, streak: 2, readingAgeDays: 0.3 });

// Happy pull: archive → update → audit.
{
  const r = row({ sku: 'MATCH' });
  const { stripe, supabase, calls } = stubs({});
  const res = await pullSoldOut(stripe, supabase, plan(r), { dryRun: false, source: 'dashboard' });
  assert.equal(res.ok, true);
  assert.equal(res.auditError, null);
  assert.deepEqual(
    calls.map((c) => c.kind),
    ['stripe.retrieve', 'stripe.update', 'parts.update', 'audit.insert']
  );
  const update = calls[1].args as { params: { active: boolean } };
  assert.equal(update.params.active, false);
  const patch = (calls[2].args as { patch: Record<string, unknown> }).patch;
  assert.equal(patch.sales_type, 'quote_only');
  assert.equal(patch.is_in_stock, false);
  assert.equal(patch.stripe_price_id, null);
  const audit = (calls[3].args as { entry: AuditEntry }).entry;
  assert.equal(audit.action, 'pull');
  assert.equal(audit.source, 'dashboard');
  assert.equal(audit.sku, 'MATCH');
  assert.deepEqual(audit.stripe, { archived: 'price_live' });
  assert.equal(audit.before.sales_type, 'direct');
  assert.equal(audit.after.sales_type, 'quote_only');
  assert.equal(audit.after.stripe_price_id, null);
}

// Dry run touches nothing.
{
  const r = row({ sku: 'MATCH' });
  const { stripe, supabase, calls } = stubs({});
  const res = await pullSoldOut(stripe, supabase, plan(r), { dryRun: true, source: 'cli' });
  assert.equal(res.ok, true);
  assert.match(res.note, /would archive/);
  assert.deepEqual(calls.map((c) => c.kind), ['stripe.retrieve']);
}

// Ownership mismatch: row goes quote-only, Stripe left alone, audit says so.
{
  const r = row({ sku: 'OURS' });
  const { stripe, supabase, calls } = stubs({ priceSku: 'SOMEONE_ELSE' });
  const res = await pullSoldOut(stripe, supabase, plan(r), { dryRun: false, source: 'cli' });
  assert.equal(res.ok, true);
  assert.match(res.note, /Stripe price left active/);
  assert.deepEqual(calls.map((c) => c.kind), ['stripe.retrieve', 'parts.update', 'audit.insert']);
  const patch = (calls[1].args as { patch: Record<string, unknown> }).patch;
  assert.equal('stripe_price_id' in patch, false, 'price id must not be cleared when we did not archive it');
  const audit = (calls[2].args as { entry: AuditEntry }).entry;
  assert.equal(audit.stripe?.archived, null);
}

// DB failure after archive restores the Stripe price.
{
  const r = row({ sku: 'MATCH' });
  const { stripe, supabase, calls } = stubs({ partsUpdateError: 'boom' });
  const res = await pullSoldOut(stripe, supabase, plan(r), { dryRun: false, source: 'dashboard' });
  assert.equal(res.ok, false);
  assert.match(res.note, /Stripe price restored/);
  const updates = calls.filter((c) => c.kind === 'stripe.update').map((c) => (c.args as { params: { active: boolean } }).params.active);
  assert.deepEqual(updates, [false, true]);
  assert.equal(calls.some((c) => c.kind === 'audit.insert'), false, 'no audit row for a failed op');
}

// Audit insert failing is reported but does not undo the pull.
{
  const r = row({ sku: 'MATCH' });
  const { stripe, supabase } = stubs({ auditError: 'rls' });
  const res = await pullSoldOut(stripe, supabase, plan(r), { dryRun: false, source: 'dashboard' });
  assert.equal(res.ok, true);
  assert.equal(res.auditError, 'rls');
}

// Happy relist: restore → update → audit.
{
  const r = row({
    sku: 'MATCH',
    sales_type: 'quote_only',
    stripe_price_id: null,
    metadata: {
      availability_note: PULLED_AVAILABILITY_NOTE,
      mag_watch: { pulled_at: hoursAgo(30), prior_stripe_price_id: 'price_old', prior_sales_type: 'direct' },
    },
  });
  const { stripe, supabase, calls } = stubs({});
  const res = await relist(stripe, supabase, r, { dryRun: false, source: 'dashboard', note: 'stock confirmed by operator via dashboard' });
  assert.equal(res.ok, true);
  assert.deepEqual(calls.map((c) => c.kind), ['stripe.update', 'parts.update', 'audit.insert']);
  const update = calls[0].args as { id: string; params: { active: boolean } };
  assert.equal(update.id, 'price_old');
  assert.equal(update.params.active, true);
  const patch = (calls[1].args as { patch: Record<string, unknown> }).patch;
  assert.equal(patch.sales_type, 'direct');
  assert.equal(patch.is_in_stock, true);
  assert.equal(patch.stripe_price_id, 'price_old');
  assert.equal('availability_note' in (patch.metadata as Record<string, unknown>), false);
  const audit = (calls[2].args as { entry: AuditEntry }).entry;
  assert.equal(audit.action, 'relist');
  assert.deepEqual(audit.stripe, { restored: 'price_old' });
  assert.equal(audit.note, 'stock confirmed by operator via dashboard');
}

// Relist DB failure re-archives the price so Stripe and the row agree.
{
  const r = row({
    sku: 'MATCH',
    sales_type: 'quote_only',
    stripe_price_id: null,
    metadata: { mag_watch: { pulled_at: hoursAgo(30), prior_stripe_price_id: 'price_old' } },
  });
  const { stripe, supabase, calls } = stubs({ partsUpdateError: 'boom' });
  const res = await relist(stripe, supabase, r, { dryRun: false, source: 'cli' });
  assert.equal(res.ok, false);
  const updates = calls.filter((c) => c.kind === 'stripe.update').map((c) => (c.args as { params: { active: boolean } }).params.active);
  assert.deepEqual(updates, [true, false]);
}

// Relist refuses ineligible rows before touching anything.
{
  const r = row({ sales_type: 'quote_only', stripe_price_id: null });
  const { stripe, supabase, calls } = stubs({});
  const res = await relist(stripe, supabase, r, { dryRun: false, source: 'dashboard' });
  assert.equal(res.ok, false);
  assert.equal(calls.length, 0);
}

// ---------------------------------------------------------------------------
// repriceEligibility — the bands that decide whether Apply is armed
// ---------------------------------------------------------------------------
{
  // Modest gap, no cost, in stock → apply at ~5% under Mag.
  const e = repriceEligibility(pricedRow({ ourSell: 120, mag: 100 }), { now: NOW });
  assert.equal(e.kind, 'apply');
  if (e.kind === 'apply') {
    assert.equal(e.plan.proposedSell, 95);
    assert.equal(e.plan.deltaDollars, 25);
    assert.equal(e.plan.cost, null);
  }

  // Priced under Mag → apply as a raise.
  const raise = repriceEligibility(pricedRow({ ourSell: 40, mag: 100 }), { now: NOW });
  assert.equal(raise.kind, 'apply');
  if (raise.kind === 'apply') assert.equal(raise.plan.deltaDollars, -55);

  // A raise beyond 3× with no cost → verify (the $16 switch that Mag says is $539).
  const bigRaise = repriceEligibility(pricedRow({ ourSell: 16, mag: 572 }), { now: NOW });
  assert.equal(bigRaise.kind, 'verify');
  if (bigRaise.kind === 'verify') assert.match(bigRaise.why, /before raising/);
  // With a cost the raise is trusted — cost means we know what the part is.
  assert.equal(repriceEligibility(pricedRow({ ourSell: 16, mag: 572, cost: 300 }), { now: NOW }).kind, 'apply');

  // Operator lock beats everything else that would arm the button.
  const lockedRow = pricedRow({ ourSell: 120, mag: 100, cost: 60 });
  lockedRow.metadata = { ...lockedRow.metadata, reprice_hold: { reason: 'priced against OEM, not Mag' } };
  const locked = repriceEligibility(lockedRow, { now: NOW });
  assert.equal(locked.kind, 'hold');
  if (locked.kind === 'hold') assert.equal(locked.why, 'priced against OEM, not Mag');

  // Beyond 1.5× with no cost → verify the item, no button.
  const verify = repriceEligibility(pricedRow({ ourSell: 89, mag: 10 }), { now: NOW });
  assert.equal(verify.kind, 'verify');
  if (verify.kind === 'verify') assert.match(verify.why, /8\.9×/);

  // Exactly at the 1.5× boundary still applies; a hair over verifies.
  assert.equal(repriceEligibility(pricedRow({ ourSell: 150, mag: 100 }), { now: NOW }).kind, 'apply');
  assert.equal(repriceEligibility(pricedRow({ ourSell: 151, mag: 100 }), { now: NOW }).kind, 'verify');

  // With cost: Mag sticker at/under our cost → hold (the 333/H5787 case).
  const hold = repriceEligibility(pricedRow({ ourSell: 300, mag: 200, cost: 210 }), { now: NOW });
  assert.equal(hold.kind, 'hold');
  if (hold.kind === 'hold') assert.match(hold.why, /at\/under our cost/);

  // With cost: large gap is fine because the floor protects us — cost means it is the same item.
  const bigWithCost = repriceEligibility(pricedRow({ ourSell: 500, mag: 100, cost: 60 }), { now: NOW });
  assert.equal(bigWithCost.kind, 'apply');
  if (bigWithCost.kind === 'apply') assert.equal(bigWithCost.plan.proposedSell, 95);

  // With cost: floor pushes the proposal above comp-5% — still an apply, note says why.
  const floored = repriceEligibility(pricedRow({ ourSell: 200, mag: 100, cost: 90 }), { now: NOW });
  assert.equal(floored.kind, 'apply');
  if (floored.kind === 'apply') {
    assert.equal(floored.plan.method, 'margin_floor');
    assert.ok(floored.plan.proposedSell > 95);
  }

  // Already at the proposal → skip, no pointless Stripe price.
  assert.equal(repriceEligibility(pricedRow({ ourSell: 95, mag: 100 }), { now: NOW }).kind, 'skip');

  // Vendor sold out → skip (that is the pull lane, not reprice).
  const so = repriceEligibility(pricedRow({ ourSell: 120, mag: 100, availability: 'backorder' }), { now: NOW });
  assert.equal(so.kind, 'skip');
  if (so.kind === 'skip') assert.match(so.why, /pull, do not reprice/);

  // Limited on hand is fine for a reprice.
  assert.equal(repriceEligibility(pricedRow({ ourSell: 120, mag: 100, availability: 'limited' }), { now: NOW }).kind, 'apply');

  // Stale reading → skip.
  assert.equal(repriceEligibility(pricedRow({ ourSell: 120, mag: 100, ageHours: 24 * 4 }), { now: NOW }).kind, 'skip');

  // ≥75 lb → skip.
  assert.equal(repriceEligibility(pricedRow({ ourSell: 120, mag: 100, weightLb: 80 }), { now: NOW }).kind, 'skip');

  // Seats and cushions use the same gate as any other TVH-network part. Skip-comps
  // plus the cost/verify bands already cover the thin-margin rows we refused to list.
  assert.equal(repriceEligibility(pricedRow({ ourSell: 120, mag: 100, category: 'Seats' }), { now: NOW }).kind, 'apply');
  const cushion = repriceEligibility(
    pricedRow({ ourSell: 265, mag: 250, category: 'Seat cushions' }),
    { now: NOW }
  );
  assert.equal(cushion.kind, 'apply');

  // Skip-comps list wins.
  const skipped = repriceEligibility(pricedRow({ ourSell: 120, mag: 100, oem: '7338638' }), {
    now: NOW,
    skipOems: new Set(['7338638']),
  });
  assert.equal(skipped.kind, 'skip');
  if (skipped.kind === 'skip') assert.match(skipped.why, /skip-comps/);

  // No Stripe product → skip (nothing to attach a price to).
  assert.equal(repriceEligibility(pricedRow({ ourSell: 120, mag: 100, stripeProductId: null }), { now: NOW }).kind, 'skip');

  // Quote-only rows never reprice here.
  const q = pricedRow({ ourSell: 120, mag: 100 });
  q.sales_type = 'quote_only';
  assert.equal(repriceEligibility(q, { now: NOW }).kind, 'skip');
}

// ---------------------------------------------------------------------------
// applyReprice IO: create → update → archive old → audit
// ---------------------------------------------------------------------------
{
  const r = pricedRow({ ourSell: 120, mag: 100 });
  const e = repriceEligibility(r, { now: NOW });
  assert.equal(e.kind, 'apply');
  if (e.kind !== 'apply') throw new Error('unreachable');

  const { stripe, supabase, calls } = stubs({});
  const res = await applyReprice(stripe, supabase, e.plan, { dryRun: false, source: 'dashboard', note: 'realign via dashboard' });
  assert.equal(res.ok, true);
  assert.deepEqual(
    calls.map((c) => c.kind),
    ['stripe.create', 'parts.update', 'stripe.update', 'audit.insert']
  );
  const created = calls[0].args as { product: string; unit_amount: number; metadata: Record<string, string> };
  assert.equal(created.product, 'prod_live');
  assert.equal(created.unit_amount, 9500);
  assert.equal(created.metadata.reason, 'mag_realign_no_cost');
  const patch = (calls[1].args as { patch: Record<string, unknown> }).patch;
  assert.equal(patch.price, 95);
  assert.equal(patch.price_cents, 9500);
  assert.equal(patch.stripe_price_id, 'price_new');
  const meta = patch.metadata as Record<string, unknown>;
  assert.equal(meta.provisional_pricing, true);
  assert.ok(Array.isArray(meta.competitor_prices), 'existing metadata preserved');
  const archived = calls[2].args as { id: string; params: { active: boolean } };
  assert.equal(archived.id, 'price_live');
  assert.equal(archived.params.active, false);
  const audit = (calls[3].args as { entry: AuditEntry }).entry;
  assert.equal(audit.action, 'reprice');
  assert.deepEqual(audit.stripe, { created: 'price_new', archived: 'price_live', mag_price: 100 });
  assert.equal(audit.before.price, 120);
  assert.equal(audit.after.price, 95);
  assert.equal(audit.after.stripe_price_id, 'price_new');
}

// With a cost the row is not provisional.
{
  const r = pricedRow({ ourSell: 120, mag: 100, cost: 60 });
  const e = repriceEligibility(r, { now: NOW });
  if (e.kind !== 'apply') throw new Error('expected apply');
  const { stripe, supabase, calls } = stubs({});
  await applyReprice(stripe, supabase, e.plan, { dryRun: false, source: 'cli' });
  const patch = (calls[1].args as { patch: Record<string, unknown> }).patch;
  assert.equal((patch.metadata as Record<string, unknown>).provisional_pricing, false);
  assert.equal((calls[0].args as { metadata: Record<string, string> }).metadata.reason, 'mag_realign_with_cost');
}

// Dry run creates nothing.
{
  const r = pricedRow({ ourSell: 120, mag: 100 });
  const e = repriceEligibility(r, { now: NOW });
  if (e.kind !== 'apply') throw new Error('expected apply');
  const { stripe, supabase, calls } = stubs({});
  const res = await applyReprice(stripe, supabase, e.plan, { dryRun: true, source: 'cli' });
  assert.equal(res.ok, true);
  assert.match(res.note, /would price \$120 → \$95/);
  assert.equal(calls.length, 0);
}

// DB failure archives the new price and leaves the old one active.
{
  const r = pricedRow({ ourSell: 120, mag: 100 });
  const e = repriceEligibility(r, { now: NOW });
  if (e.kind !== 'apply') throw new Error('expected apply');
  const { stripe, supabase, calls } = stubs({ partsUpdateError: 'boom' });
  const res = await applyReprice(stripe, supabase, e.plan, { dryRun: false, source: 'dashboard' });
  assert.equal(res.ok, false);
  assert.match(res.note, /new price archived/);
  const updates = calls.filter((c) => c.kind === 'stripe.update').map((c) => c.args as { id: string; params: { active: boolean } });
  assert.deepEqual(updates, [{ id: 'price_new', params: { active: false } }]);
  assert.equal(calls.some((c) => c.kind === 'audit.insert'), false);
}

// auditSnapshot keeps only the fields that matter.
{
  const snap = auditSnapshot(row({ metadata: { big: 'x'.repeat(1000), mag_watch: { a: 1 } } }));
  assert.deepEqual(Object.keys(snap).sort(), ['is_in_stock', 'mag_watch', 'price', 'sales_type', 'stripe_price_id']);
  assert.deepEqual(snap.mag_watch, { a: 1 });
}

console.log('magWatchOps.test.ts: all assertions passed');
