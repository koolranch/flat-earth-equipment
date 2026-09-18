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
  category?: string | null;
  categorySlug?: string | null;
  imageUrl?: string | null;
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
    category: overrides.category === undefined ? 'Construction Equipment Parts' : overrides.category,
    category_slug: overrides.categorySlug ?? 'construction-equipment-parts',
    sales_type: overrides.salesType ?? 'direct',
    is_in_stock: true,
    price: overrides.price === undefined ? 500 : overrides.price,
    price_cents: null,
    oem_reference: oem,
    stripe_price_id: 'price_live_test',
    stripe_product_id: 'prod_live_test',
    image_url: overrides.imageUrl === undefined ? null : overrides.imageUrl,
    metadata: overrides.metadata ?? null,
  };
}

const LOGO = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/jcb.webp';
const REAL = '/images/parts/jcb-716-c8932-throttle-pedal.jpg';

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
  /** Hero reading as the watch script stores it. Omit to simulate a pre-hero read. */
  hero?: { filename: string | null; identityOk?: boolean; placeholder?: boolean };
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
      ...(opts.hero
        ? {
            hero: {
              checked_at: fetchedAt,
              filename: opts.hero.filename,
              identity_ok: opts.hero.identityOk ?? false,
              placeholder_suspect: opts.hero.placeholder ?? false,
            },
          }
        : {}),
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
  assert.equal(d.inventoryBook.liveBuyNowCount, 0, 'no vendor in-stock reading yet');
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

  // Apply is armed for the modest gap and the under-half row, and the summary counts them.
  assert.equal(above.reprice.kind, 'apply');
  assert.equal(cheap.reprice.kind, 'apply', 'a 2.8× raise is under the 3× verify line');
  assert.equal(d.moverSummary.applyReady, 2);
  assert.equal(d.moverSummary.hold, 0);
  assert.equal(d.moverSummary.verify, 0);
}

// ---------------------------------------------------------------------------
// The reprice decision on each mover mirrors the server-side gate.
// ---------------------------------------------------------------------------
{
  const d = buildWatchDashboard(
    [
      // 8.9× the sticker, no cost → verify, never a button.
      row({ oem: '333/C1', price: 89, metadata: meta({ price: 10 }) }),
      // Skip-comps OEM → skip even though the gap is modest.
      row({ oem: '7338638', brand: 'Bobcat', price: 520, metadata: meta({ price: 476 }) }),
      // Sticker under our cost → hold.
      row({ oem: '333/C3', price: 419, metadata: meta({ price: 332, cost: 389 }) }),
      // Operator lock → hold with the operator's words.
      row({
        oem: '333/C4',
        price: 1699,
        metadata: { ...meta({ price: 1721, cost: 1310 }), reprice_hold: { reason: 'do not cut' } },
      }),
    ],
    NOW,
    { skipOems: new Set(['7338638']) }
  );
  const by = (oem: string) => d.movers.find((m) => m.oem === oem)!;
  assert.equal(by('333/C1').reprice.kind, 'verify');
  assert.equal(by('7338638').reprice.kind, 'skip');
  assert.equal(by('333/C3').reprice.kind, 'hold');
  const locked = by('333/C4').reprice;
  assert.equal(locked.kind, 'hold');
  if (locked.kind === 'hold') assert.equal(locked.why, 'do not cut');
  assert.equal(d.moverSummary.applyReady, 0);
  assert.equal(d.moverSummary.hold, 2);
  assert.equal(d.moverSummary.verify, 1);
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
  // No image on the row → photo queue, never a Publish button.
  assert.equal(d.convertible[0].publish.kind, 'needs_photo');
  assert.equal(d.convertibleSummary.ready, 0);
  assert.equal(d.convertibleSummary.needsPhoto, 1);
}

// ---------------------------------------------------------------------------
// Publish decisions: real photo arms the button; the vendor-hero flag drives the
// photo queue ordering; limited stock is a skip.
// ---------------------------------------------------------------------------
{
  const d = buildWatchDashboard(
    [
      // Real photo + solid stock → ready.
      row({
        oem: '333/PUB1',
        salesType: 'quote_only',
        price: 0,
        imageUrl: REAL,
        metadata: meta({ price: 300, qty: 6 }),
      }),
      // No photo, but the vendor page showed an identity-passing hero → front of photo queue.
      row({
        oem: '333/PUB2',
        salesType: 'quote_only',
        price: 0,
        metadata: meta({ price: 200, qty: 5, hero: { filename: 'x-333pub2.jpg', identityOk: true } }),
      }),
      // Brand logo hero and no vendor image → back of photo queue.
      row({
        oem: '333/PUB3',
        salesType: 'quote_only',
        price: 0,
        imageUrl: LOGO,
        metadata: meta({ price: 900, qty: 3 }),
      }),
      // Limited on hand → skip, not enough for a new Buy Now.
      row({
        oem: '333/PUB4',
        salesType: 'quote_only',
        price: 0,
        imageUrl: REAL,
        metadata: meta({ price: 400, qty: 1, availability: 'limited' }),
      }),
    ],
    NOW
  );
  assert.equal(d.convertibleSummary.ready, 1);
  assert.equal(d.convertibleSummary.needsPhoto, 2);
  assert.equal(d.convertibleSummary.photoQueueWithVendorHero, 1);
  // Ready first, then vendor-hero-in-hand, then the bare logo row despite its bigger
  // sticker, then skips (the limited row shows with its reason but no button).
  assert.deepEqual(
    d.convertible.map((c) => c.oem),
    ['333/PUB1', '333/PUB2', '333/PUB3', '333/PUB4']
  );
  assert.equal(d.convertible[1].publish.kind, 'needs_photo');
  assert.equal(d.inventoryBook.readyToPublishCount, 1);
  assert.equal(d.inventoryBook.readyToPublishUnits, 6);
  assert.equal(
    d.inventoryBook.readyToPublishDollars,
    (d.convertible[0].proposedSell ?? 0) * 6
  );
  assert.equal(d.inventoryBook.waitingOnPhotoCount, 2);
  assert.equal(d.inventoryBook.waitingOnPhotoUnits, 5 + 3);
  assert.ok(d.inventoryBook.waitingOnPhotoDollars > 0);
  if (d.convertible[1].publish.kind === 'needs_photo') {
    assert.equal(d.convertible[1].publish.heroSeenOnVendor, true);
  }
  const limitedRow = d.convertible[3];
  assert.equal(limitedRow.publish.kind, 'skip');
  if (limitedRow.publish.kind === 'skip') assert.match(limitedRow.publish.why, /limited/);
  assert.equal(d.limited.length, 1, 'limited row also surfaces in the Limited review list');
}

{
  const d = buildWatchDashboard(
    [
      row({
        oem: '333/LIVE1',
        price: 200,
        imageUrl: REAL,
        metadata: meta({ price: 210, qty: 10, availability: 'in_stock' }),
      }),
      row({
        oem: '333/GONE1',
        price: 400,
        imageUrl: REAL,
        metadata: meta({ price: 420, qty: 0, availability: 'backorder' }),
      }),
    ],
    NOW
  );
  assert.equal(d.inventoryBook.liveBuyNowCount, 1);
  assert.equal(d.inventoryBook.liveBuyNowUnits, 10);
  assert.equal(d.inventoryBook.liveBuyNowDollars, 2000);
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

// ---------------------------------------------------------------------------
// Hero coverage: gaps, eligibility, and what the vendor page exposed.
// ---------------------------------------------------------------------------
{
  const usable = { filename: 'electronic-sensor-jc333d1629.jpg', identityOk: true };
  const rows = [
    // Buy Now, real photo — no gap regardless of vendor hero.
    row({ imageUrl: REAL, metadata: meta({ hero: usable }) }),
    // Buy Now, brand logo, vendor hero usable → tray-ready.
    row({ imageUrl: LOGO, metadata: meta({ hero: usable }) }),
    // Buy Now, no photo, vendor hero failed identity (carousel image).
    row({ imageUrl: null, metadata: meta({ hero: { filename: 'sensor-gb106100.jpg', identityOk: false } }) }),
    // Buy Now, no photo, vendor hero is a placeholder graphic.
    row({
      imageUrl: null,
      metadata: meta({ hero: { filename: 'no-image-available.jpg', identityOk: false, placeholder: true } }),
    }),
    // Buy Now, no photo, read happened but page exposed no hero.
    row({ imageUrl: null, metadata: meta({ hero: { filename: null } }) }),
    // Buy Now, no photo, never read.
    row({ imageUrl: null }),
    // Buy Now, logo, read before hero capture existed (no hero key at all).
    row({ imageUrl: LOGO, metadata: meta({}) }),
    // Seat with a logo and a usable vendor hero — same tray path as any other gap.
    row({ imageUrl: LOGO, category: 'Seats', metadata: meta({ hero: usable }) }),
    // Quote-only, no photo, usable hero → tray-ready on the quote side.
    row({ salesType: 'quote_only', price: 0, imageUrl: null, metadata: meta({ hero: usable }) }),
    // Quote-only with a real CDN photo.
    row({
      salesType: 'quote_only',
      price: 0,
      imageUrl: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/x.jpg',
    }),
  ];
  const d = buildWatchDashboard(rows, NOW);

  const buy = d.hero.rows.find((r) => r.label === 'Buy Now')!;
  assert.equal(buy.total, 8);
  assert.equal(buy.realPhoto, 1);
  assert.equal(buy.brandLogo, 3, 'two logo parts plus the logo seat');
  assert.equal(buy.noPhoto, 4);
  assert.equal(buy.gapEligible, 7);
  assert.equal(buy.notYetRead, 1);
  assert.equal(buy.vendorHeroSeen, 4, 'two usable + carousel + placeholder; the no-hero read and pre-hero read do not count');
  assert.equal(buy.vendorHeroUsable, 2);

  const quote = d.hero.rows.find((r) => r.label === 'Quote-only')!;
  assert.equal(quote.total, 2);
  assert.equal(quote.realPhoto, 1);
  assert.equal(quote.gapEligible, 1);
  assert.equal(quote.vendorHeroUsable, 1);

  assert.equal(d.hero.trayReady, 3, 'two Buy Now logo rows (including the seat) and one quote-only gap row');
  assert.equal(d.hero.identityFailed, 1, 'placeholder is counted as placeholder, not as an identity failure');
}

console.log('magWatchDashboard.test.ts: all assertions passed');
