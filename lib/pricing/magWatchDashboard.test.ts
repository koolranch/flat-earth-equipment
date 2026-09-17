import assert from 'node:assert/strict';
import { buildWatchDashboard } from './magWatchDashboard';
import type { WatchRow } from './magWatchUniverse';

const NOW = new Date('2026-09-17T14:00:00.000Z');
const HOURS_AGO = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString();
const DAYS_AGO = (d: number) => HOURS_AGO(d * 24);

let nextId = 0;

function row(overrides: {
  brand?: string | null;
  oem?: string;
  price?: number | null;
  salesType?: string;
  categorySlug?: string | null;
  metadata?: Record<string, unknown>;
}): WatchRow {
  nextId++;
  const oem = overrides.oem ?? `PN${nextId}`;
  return {
    id: `row-${nextId}`,
    sku: `SKU-${nextId}`,
    slug: `slug-${nextId}`,
    name: `Part ${nextId}`,
    brand: overrides.brand === undefined ? 'JCB' : overrides.brand,
    category: 'Construction Equipment Parts',
    category_slug: overrides.categorySlug ?? 'construction-equipment-parts',
    sales_type: overrides.salesType ?? 'direct',
    is_in_stock: true,
    price: overrides.price === undefined ? 500 : overrides.price,
    price_cents: null,
    oem_reference: oem,
    stripe_price_id: 'price_live_test',
    metadata: overrides.metadata ?? null,
  };
}

/** Shape the watch script writes: the vendor snapshot plus the per-row job state. */
function meta(opts: {
  price?: number | null;
  listPrice?: number | null;
  qty?: number | null;
  availability?: string;
  fetchedAt?: string;
  soldOutStreak?: number;
  missCount?: number;
  pulledAt?: string;
  priorStripePriceId?: string | null;
  backorderEta?: string | null;
  weightLb?: number | null;
  cost?: number;
}): Record<string, unknown> {
  const fetchedAt = opts.fetchedAt ?? HOURS_AGO(6);
  return {
    ...(opts.cost !== undefined ? { cost_wholesale: opts.cost } : {}),
    competitor_prices: [
      { source: 'intella', price: 999 },
      {
        source: 'magnasource',
        url: 'https://www.magnasourceinc.com/itemdetail/JC333/D1629',
        price: opts.price ?? null,
        list_price: opts.listPrice ?? null,
        qty_on_hand: opts.qty ?? null,
        availability: opts.availability ?? 'in_stock',
        fetched_at: fetchedAt,
        weight_lb: opts.weightLb ?? null,
        backorder_eta: opts.backorderEta ?? null,
      },
    ],
    mag_watch: {
      last_checked_at: fetchedAt,
      last_availability: opts.availability ?? 'in_stock',
      sold_out_streak: opts.soldOutStreak ?? 0,
      miss_count: opts.missCount ?? 0,
      ...(opts.pulledAt
        ? {
            pulled_at: opts.pulledAt,
            pull_reason: 'magnasource backorder on 2 consecutive reads',
            prior_sales_type: 'direct',
            prior_stripe_price_id:
              'priorStripePriceId' in opts ? opts.priorStripePriceId : 'price_archived_1',
          }
        : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// Scope: only in-scope brands and categories are counted.
// ---------------------------------------------------------------------------
{
  const rows = [
    row({ brand: 'JCB' }),
    row({ brand: 'Genie' }),
    row({ brand: 'Lithium Rhino' }), // brand out of scope
    row({ brand: 'JCB', categorySlug: 'rubber-tracks' }), // excluded category
    row({ brand: 'JCB', categorySlug: 'charger-modules' }), // excluded category
    row({
      brand: 'JCB',
      metadata: { vendor_supply_chain: 'fsip' }, // excluded supply chain
    }),
  ];
  const d = buildWatchDashboard(rows, NOW);
  assert.equal(d.counts.catalogRows, 6);
  assert.equal(d.counts.inScope, 2, 'only the two clean equipment rows are in scope');
  assert.equal(d.counts.outOfScope, 4);
  assert.equal(d.counts.neverChecked, 2, 'no readings written yet');
  assert.equal(d.lastReadingAt, null);
}

// ---------------------------------------------------------------------------
// Buy Now vs quote-only, and the tier split by sticker exposure.
// ---------------------------------------------------------------------------
{
  const rows = [
    row({ price: 2800 }), // A
    row({ price: 150 }), // B
    row({ price: 40 }), // C
    row({ salesType: 'quote_only', price: 0 }), // D
  ];
  const d = buildWatchDashboard(rows, NOW);
  assert.equal(d.counts.buyNow, 3);
  assert.equal(d.counts.quoteOnly, 1);
  const tier = (t: string) => d.tiers.find((x) => x.tier === t)!;
  assert.equal(tier('A').total, 1);
  assert.equal(tier('B').total, 1);
  assert.equal(tier('C').total, 1);
  assert.equal(tier('D').total, 1);
}

// ---------------------------------------------------------------------------
// Pull queue: a second sold-out read arms the pull, the first only watches.
// ---------------------------------------------------------------------------
{
  const rows = [
    row({
      oem: '333/D1111',
      price: 900,
      metadata: meta({
        availability: 'backorder',
        qty: 0,
        soldOutStreak: 2,
        backorderEta: 'Oct 2 – Oct 9',
      }),
    }),
    row({
      oem: '333/D2222',
      price: 400,
      metadata: meta({ availability: 'special_order', qty: 0, soldOutStreak: 1 }),
    }),
    // Sold out but quote-only already: nothing to pull.
    row({
      oem: '333/D3333',
      salesType: 'quote_only',
      price: 0,
      metadata: meta({ availability: 'backorder', soldOutStreak: 3 }),
    }),
  ];
  const d = buildWatchDashboard(rows, NOW);
  assert.equal(d.pullQueue.length, 2, 'quote-only sold-out rows stay out of the pull queue');

  const ready = d.pullQueue.filter((p) => p.readyToPull);
  assert.equal(ready.length, 1);
  assert.equal(ready[0].oem, '333/D1111');
  assert.equal(ready[0].streak, 2);
  assert.equal(ready[0].backorderEta, 'Oct 2 – Oct 9');
  assert.equal(ready[0].availability, 'backorder');
  assert.equal(d.pullQueue[0].readyToPull, true, 'ready rows sort first');

  const watching = d.pullQueue.filter((p) => !p.readyToPull);
  assert.equal(watching.length, 1);
  assert.equal(watching[0].oem, '333/D2222');
}

// ---------------------------------------------------------------------------
// Limited never lands in the pull queue — the vendor has held stock while the
// public page read low.
// ---------------------------------------------------------------------------
{
  const d = buildWatchDashboard(
    [row({ oem: '333/H8243', price: 600, metadata: meta({ availability: 'limited', qty: 1, price: 700 }) })],
    NOW
  );
  assert.equal(d.pullQueue.length, 0);
  assert.equal(d.limited.length, 1);
  assert.equal(d.limited[0].qtyOnHand, 1);
  assert.equal(d.limited[0].isBuyNow, true);
}

// ---------------------------------------------------------------------------
// Sticker movers: priced above the vendor is always surfaced, on-target is not.
// ---------------------------------------------------------------------------
{
  const rows = [
    row({ oem: '333/A1', price: 400, metadata: meta({ price: 340.83 }) }), // above vendor
    row({ oem: '333/A2', price: 323, metadata: meta({ price: 340.83 }) }), // ~5% under, on target
    row({ oem: '333/A3', price: 120, metadata: meta({ price: 340.83 }) }), // under half the sticker
  ];
  const d = buildWatchDashboard(rows, NOW);
  const oems = d.movers.map((m) => m.oem);
  assert.ok(oems.includes('333/A1'), 'priced above the vendor must surface');
  assert.ok(!oems.includes('333/A2'), 'on-target rows stay quiet');
  assert.ok(oems.includes('333/A3'), 'a large gap below target surfaces');

  const above = d.movers.find((m) => m.oem === '333/A1')!;
  assert.equal(above.aboveMag, true);
  assert.equal(above.severity, 'above_vendor');
  assert.ok(above.actualDiscountPct < 0, 'negative discount means above the sticker');

  const cheap = d.movers.find((m) => m.oem === '333/A3')!;
  assert.equal(cheap.severity, 'far_below', 'under half the sticker is its own problem class');
  assert.ok(cheap.opportunity > 0, 'raising the price is the opportunity');

  assert.equal(d.movers[0].severity, 'above_vendor', 'priced-above rows sort first');
  assert.equal(d.moverSummary.aboveVendor, 1);
  assert.equal(d.moverSummary.farBelow, 1);
  assert.equal(d.moverSummary.offTarget, 0);
  assert.ok(d.moverSummary.farBelowOpportunity > 0);
  assert.equal(d.moverSummary.missingCost, 2, 'these fixtures record no wholesale cost');
}

// ---------------------------------------------------------------------------
// Ordinary drift is separated from the two money-losing classes.
// ---------------------------------------------------------------------------
{
  const d = buildWatchDashboard(
    // 12% under a $100 sticker: off target, but not below half and not above the vendor.
    [row({ oem: '333/B1', price: 88, metadata: meta({ price: 100 }) })],
    NOW
  );
  assert.equal(d.movers.length, 1);
  assert.equal(d.movers[0].severity, 'off_target');
  assert.equal(d.moverSummary.offTarget, 1);
  assert.equal(d.moverSummary.aboveVendor, 0);
  assert.equal(d.moverSummary.farBelow, 0);
  assert.equal(d.moverSummary.farBelowOpportunity, 0);
}

// ---------------------------------------------------------------------------
// Quote-only stubs reading in stock are conversion candidates, not movers.
// ---------------------------------------------------------------------------
{
  const d = buildWatchDashboard(
    [
      row({
        oem: '333/S1',
        salesType: 'quote_only',
        price: 0,
        metadata: meta({ price: 1200, qty: 4, weightLb: 62 }),
      }),
    ],
    NOW
  );
  assert.equal(d.movers.length, 0);
  assert.equal(d.convertible.length, 1);
  assert.equal(d.convertible[0].magPrice, 1200);
  assert.equal(d.convertible[0].weightLb, 62);
  assert.ok(
    d.convertible[0].proposedSell !== null && d.convertible[0].proposedSell < 1200,
    'proposed sell undercuts the vendor sticker'
  );
}

// ---------------------------------------------------------------------------
// Pulled rows become history, not action items, and keep their relist path.
// ---------------------------------------------------------------------------
{
  const d = buildWatchDashboard(
    [
      row({
        oem: '333/P1',
        salesType: 'quote_only',
        price: 0,
        metadata: meta({
          availability: 'backorder',
          soldOutStreak: 2,
          pulledAt: DAYS_AGO(1),
        }),
      }),
      row({
        oem: '333/P2',
        salesType: 'quote_only',
        price: 0,
        metadata: meta({
          availability: 'backorder',
          soldOutStreak: 2,
          pulledAt: DAYS_AGO(3),
          priorStripePriceId: null,
        }),
      }),
    ],
    NOW
  );
  assert.equal(d.pulled.length, 2);
  assert.equal(d.pulled[0].oem, '333/P1', 'most recent pull first');
  assert.equal(d.pulled[0].canRelist, true);
  assert.equal(d.pulled[1].canRelist, false, 'no saved price id means relist by hand');
  assert.equal(d.pullQueue.length, 0, 'already pulled — not an action item');
  assert.equal(d.limited.length, 0);
  assert.equal(d.convertible.length, 0);
}

// ---------------------------------------------------------------------------
// Failures and retirement.
// ---------------------------------------------------------------------------
{
  const rows = [
    row({ oem: '333/F1', metadata: meta({ availability: 'invalid_pn', missCount: 1 }) }),
    row({ oem: '333/F2', metadata: meta({ availability: 'invalid_pn', missCount: 3 }) }),
  ];
  const d = buildWatchDashboard(rows, NOW);
  // miss_count 3 hits MAX_MISSES, so that row is skipped from fetching entirely.
  assert.equal(d.counts.retiredUrls, 1);
  assert.equal(d.failures.length, 1, 'the retired row leaves the fetch universe');
  assert.equal(d.failures[0].oem, '333/F1');
  assert.equal(d.failures[0].retired, false);
  assert.equal(d.pullQueue.length, 0, 'a failed read never drives a pull');
}

// ---------------------------------------------------------------------------
// Freshness accounting.
// ---------------------------------------------------------------------------
{
  const rows = [
    row({ oem: '333/T1', price: 900, metadata: meta({ fetchedAt: HOURS_AGO(3) }) }),
    row({ oem: '333/T2', price: 900, metadata: meta({ fetchedAt: DAYS_AGO(9) }) }),
    row({ oem: '333/T3', price: 900, metadata: meta({ fetchedAt: DAYS_AGO(45) }) }),
    row({ oem: '333/T4', price: 900 }), // never read
  ];
  const d = buildWatchDashboard(rows, NOW);
  assert.equal(d.counts.everChecked, 3);
  assert.equal(d.counts.checkedLast7Days, 1);
  assert.equal(d.counts.neverChecked, 1);
  assert.equal(d.counts.stale, 1, 'only the 45-day-old reading is stale');
  assert.equal(d.lastReadingAt, HOURS_AGO(3), 'newest reading wins');

  const tierA = d.tiers.find((t) => t.tier === 'A')!;
  assert.equal(tierA.total, 4);
  assert.equal(tierA.checked, 3);
  assert.equal(tierA.neverChecked, 1);
  assert.equal(tierA.oldestCheckedAt, DAYS_AGO(45));
}

// ---------------------------------------------------------------------------
// Due-today reflects the weekday cadence: Thursday is tier A + D.
// ---------------------------------------------------------------------------
{
  const thursday = new Date('2026-09-17T14:00:00.000Z');
  assert.equal(thursday.getDay(), 4);
  const d = buildWatchDashboard([row({})], thursday);
  const due = d.tiers.filter((t) => t.dueToday).map((t) => t.tier);
  assert.deepEqual(due, ['A', 'D']);

  const saturday = new Date('2026-09-19T14:00:00.000Z');
  assert.equal(saturday.getDay(), 6);
  const weekend = buildWatchDashboard([row({})], saturday);
  assert.equal(weekend.tiers.filter((t) => t.dueToday).length, 0, 'no tiers due on a weekend');
}

console.log('magWatchDashboard.test.ts: all assertions passed');
