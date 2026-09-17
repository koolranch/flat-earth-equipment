import assert from 'node:assert/strict';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  auditSnapshot,
  pullEligibility,
  pullSoldOut,
  pulledMetadata,
  relist,
  relistEligibility,
  relistedMetadata,
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
    image_url: null,
    metadata: magWatch ? { mag_watch: magWatch } : {},
    ...rest,
  };
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
type Call = { kind: 'stripe.retrieve' | 'stripe.update' | 'parts.update' | 'audit.insert'; args: unknown };

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

// auditSnapshot keeps only the fields that matter.
{
  const snap = auditSnapshot(row({ metadata: { big: 'x'.repeat(1000), mag_watch: { a: 1 } } }));
  assert.deepEqual(Object.keys(snap).sort(), ['is_in_stock', 'mag_watch', 'price', 'sales_type', 'stripe_price_id']);
  assert.deepEqual(snap.mag_watch, { a: 1 });
}

console.log('magWatchOps.test.ts: all assertions passed');
