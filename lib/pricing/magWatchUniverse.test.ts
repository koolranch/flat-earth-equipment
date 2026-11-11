import assert from 'node:assert/strict';
import {
  classifyRow,
  dedupeCandidates,
  isTrackSellOutWatch,
  lastMagQty,
  needsLowQtyRefresh,
  selectBudgetedWatchQueue,
  selectWatchQueue,
  tiersDue,
  trackWarehouseNumber,
  DAILY_PAGE_BUDGET,
  DEFAULT_QUOTE_CAP,
  HERO_FETCH_RESERVE,
  LOW_QTY_DAILY_RESERVE,
  LOW_QTY_REFRESH_CAP,
  LOW_QTY_REFRESH_MAX,
  type WatchCandidate,
  type WatchRow,
} from './magWatchUniverse';

let n = 0;

function row(over: {
  price?: number;
  salesType?: string;
  oem?: string;
  qty?: number | null;
  lastCheckedAt?: string;
  queueRank?: number;
}): WatchRow {
  n++;
  const oem = over.oem ?? `333/D${1000 + n}`;
  return {
    id: `row-${n}`,
    sku: `SKU${n}`,
    slug: `slug-${n}`,
    name: `Part ${n}`,
    brand: 'JCB',
    category: 'Construction Equipment Parts',
    category_slug: 'construction-equipment-parts',
    sales_type: over.salesType ?? 'direct',
    is_in_stock: true,
    price: over.price ?? 500,
    price_cents: null,
    oem_reference: oem,
    stripe_price_id: 'price_live',
    stripe_product_id: 'prod_live',
    image_url: null,
    metadata: {
      competitor_prices:
        over.qty === undefined
          ? []
          : [
              {
                source: 'magnasource',
                qty_on_hand: over.qty,
                availability: 'in_stock',
              },
            ],
      mag_watch: over.lastCheckedAt ? { last_checked_at: over.lastCheckedAt } : {},
      ...(over.queueRank === undefined ? {} : { mag_queue: { rank: over.queueRank } }),
    },
  };
}

function candidate(over: Parameters<typeof row>[0]): WatchCandidate {
  const classified = classifyRow(row(over));
  if ('reason' in classified) throw new Error(`unexpected skip ${classified.reason}`);
  return classified;
}

/** A rubber-track model PDP. No OEM unless one is given. */
function track(over: {
  vendorPn: string | null;
  oem?: string;
  price?: number;
  salesType?: string;
  qty?: number | null;
  /** The stored reading came from the row's own warehouse page. */
  stockOnly?: boolean;
  lastCheckedAt?: string;
  missCount?: number;
}): WatchRow {
  const base = row({ price: over.price ?? 999, salesType: over.salesType, oem: over.oem ?? '' });
  const hasReading = over.qty !== undefined;
  return {
    ...base,
    brand: 'Bobcat',
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    name: 'Bobcat T66 Rubber Track',
    oem_reference: over.oem ?? null,
    metadata: {
      ...(over.vendorPn === null ? {} : { vendor_pn: over.vendorPn }),
      competitor_prices: hasReading
        ? [
            {
              source: 'magnasource',
              qty_on_hand: over.qty,
              availability: over.qty === null ? 'special_order' : 'in_stock',
              ...(over.stockOnly ? { stock_only: true } : {}),
            },
          ]
        : [],
      mag_watch: {
        ...(over.lastCheckedAt ? { last_checked_at: over.lastCheckedAt } : {}),
        ...(over.missCount ? { miss_count: over.missCount } : {}),
      },
    },
  };
}

function trackCandidate(over: Parameters<typeof track>[0]): WatchCandidate {
  const classified = classifyRow(track(over));
  if ('reason' in classified) throw new Error(`unexpected skip ${classified.reason}`);
  return classified;
}

assert.equal(LOW_QTY_REFRESH_MAX, 3);
assert.equal(LOW_QTY_REFRESH_CAP, 80);
assert.equal(DAILY_PAGE_BUDGET, 90);
assert.equal(HERO_FETCH_RESERVE, 15);
assert.ok(LOW_QTY_DAILY_RESERVE + HERO_FETCH_RESERVE <= DAILY_PAGE_BUDGET);
assert.equal(LOW_QTY_DAILY_RESERVE, 40);
assert.equal(DEFAULT_QUOTE_CAP, 200);

assert.deepEqual(tiersDue(1), ['A', 'C']);
assert.deepEqual(tiersDue(2), ['A', 'D']);
assert.deepEqual(tiersDue(3), ['A', 'B']);
assert.deepEqual(tiersDue(4), ['A', 'D']);
assert.deepEqual(tiersDue(5), ['A', 'B', 'D']);
assert.deepEqual(tiersDue(0), []);
assert.deepEqual(tiersDue(6), []);

assert.equal(lastMagQty(row({ qty: 2 })), 2);
assert.equal(lastMagQty(row({ qty: 0 })), 0);
assert.equal(lastMagQty(row({})), null);
assert.equal(lastMagQty(row({ qty: null })), null);

const cheapLow = candidate({ price: 40, qty: 2, lastCheckedAt: '2026-09-10T00:00:00.000Z' });
const cheapFull = candidate({ price: 40, qty: 40 });
const midLow = candidate({ price: 180, qty: 1, lastCheckedAt: '2026-09-12T00:00:00.000Z' });
const expensiveLow = candidate({ price: 800, qty: 3 });
const stubInStock = candidate({
  price: 0,
  salesType: 'quote_only',
  qty: 2,
  lastCheckedAt: '',
});
const neverReadCheap = candidate({ price: 40 });

assert.equal(cheapLow.tier, 'C');
assert.equal(midLow.tier, 'B');
assert.equal(expensiveLow.tier, 'A');
assert.equal(stubInStock.tier, 'D');

assert.equal(needsLowQtyRefresh(cheapLow), true);
assert.equal(needsLowQtyRefresh(midLow), true);
assert.equal(needsLowQtyRefresh(expensiveLow), true);
assert.equal(needsLowQtyRefresh(cheapFull), false, 'qty 40 is not the sell-out window');
assert.equal(needsLowQtyRefresh(neverReadCheap), false, 'unread Buy Now is not low-qty');
assert.equal(needsLowQtyRefresh(stubInStock), false, 'quote-only never rides the low-qty pass');

// Tuesday default: A + D, plus B/C whose last Mag qty is ≤ 3. A already includes the $800.
const tuesday = selectWatchQueue(
  [cheapLow, cheapFull, midLow, expensiveLow, stubInStock, neverReadCheap],
  { tiers: ['A', 'D'], quoteCap: 200, includeLowQty: true }
);
assert.deepEqual(
  tuesday.buyNow.map((c) => c.row.price),
  [800],
  'only tier A is due'
);
assert.deepEqual(
  tuesday.lowQty.map((c) => c.row.price).sort((a, b) => (a ?? 0) - (b ?? 0)),
  [40, 180],
  'B and C at ≤3 on hand overlay the weekday run'
);
assert.equal(tuesday.stubs.length, 1);
assert.equal(
  tuesday.queue.some((c) => c.row.price === 40 && lastMagQty(c.row) === 40),
  false,
  'full-stock C waits for Monday'
);
assert.equal(
  tuesday.queue.filter((c) => c.identityKey === expensiveLow.identityKey).length,
  1,
  'A at qty 3 is not scraped twice'
);

const explicitD = selectWatchQueue([cheapLow, stubInStock, expensiveLow], {
  tiers: ['D'],
  quoteCap: 200,
  includeLowQty: false,
});
assert.equal(explicitD.buyNow.length, 0);
assert.equal(explicitD.lowQty.length, 0);
assert.equal(explicitD.stubs.length, 1);
assert.equal(explicitD.queue[0].tier, 'D');

const onlyLow = selectWatchQueue([cheapLow, expensiveLow, stubInStock, cheapFull], {
  tiers: ['A'],
  quoteCap: 200,
  includeLowQty: true,
  lowQtyOnly: true,
});
assert.deepEqual(
  onlyLow.queue.map((c) => c.row.price).sort((a, b) => (a ?? 0) - (b ?? 0)),
  [40, 800]
);
assert.equal(onlyLow.stubs.length, 0);

const manyLow: WatchCandidate[] = [];
for (let i = 0; i < LOW_QTY_REFRESH_CAP + 5; i++) {
  manyLow.push(candidate({ price: 50, qty: 1, oem: `333/L${2000 + i}` }));
}
const capped = selectWatchQueue(manyLow, {
  tiers: ['A'],
  quoteCap: 200,
  includeLowQty: true,
});
assert.equal(capped.lowQty.length, LOW_QTY_REFRESH_CAP);

const rankedFirst = candidate({ price: 0, salesType: 'quote_only', oem: '333/Q1', queueRank: 1 });
const rankedSecond = candidate({ price: 0, salesType: 'quote_only', oem: '333/Q2', queueRank: 2 });
const rankedAlreadyRead = candidate({
  price: 0,
  salesType: 'quote_only',
  oem: '333/Q3',
  queueRank: 1,
  lastCheckedAt: '2026-10-01T00:00:00.000Z',
});
const olderStub = candidate({
  price: 0,
  salesType: 'quote_only',
  oem: '333/Q4',
  lastCheckedAt: '2020-01-01T00:00:00.000Z',
});
const queued = selectWatchQueue(
  [olderStub, rankedSecond, rankedAlreadyRead, rankedFirst],
  { tiers: ['D'], quoteCap: 2, includeLowQty: false }
);
assert.deepEqual(
  queued.stubs.map((c) => c.oem),
  ['333/Q1', '333/Q2'],
  'unread mag_queue ranks fill the quote cap before older stubs'
);
const queuedAll = selectWatchQueue(
  [olderStub, rankedSecond, rankedAlreadyRead, rankedFirst],
  { tiers: ['D'], quoteCap: 10, includeLowQty: false }
);
assert.deepEqual(
  queuedAll.stubs.map((c) => c.oem),
  ['333/Q1', '333/Q2', '333/Q4', '333/Q3'],
  'a queue rank stops applying after the first read'
);

{
  const withVendorPn = classifyRow({
    ...row({ price: 2049, oem: 'L4732' }),
    category_slug: 'rubber-tracks',
    category: 'Rubber Tracks',
    name: 'JCB 150T Rubber Track 320x86x48 Block Tread',
    metadata: { vendor_pn: 'JC333/L4732' },
  });
  assert.equal('reason' in withVendorPn, false, 'OEM-numbered track PDPs stay in the scrape universe');
  if (!('reason' in withVendorPn)) {
    assert.equal(withVendorPn.magPartId, 'JC333/L4732');
    assert.equal(withVendorPn.oem, '333/L4732');
  }

  const sizeOnly = classifyRow(track({ vendorPn: 'TSA/SY320X86X50C' }));
  assert.equal('reason' in sizeOnly, false, 'a track with no OEM is read by its warehouse number');
  if (!('reason' in sizeOnly)) {
    assert.equal(sizeOnly.warehouseNumber, 'SY320X86X50C');
    assert.equal(sizeOnly.magPartId, 'SY320X86X50C');
    assert.equal(sizeOnly.magUrl, 'https://www.magnasourceinc.com/itemdetail/SY320X86X50C');
    assert.equal(sizeOnly.oem, '', 'the warehouse number is never presented as an OEM cross');
    assert.equal(sizeOnly.identityKey, 'WAREHOUSE|SY320X86X50C');
  }
  if (!('reason' in withVendorPn)) assert.equal(withVendorPn.warehouseNumber, null);
}

// Warehouse-number reads: only the TSA/ wrapper comes off, and only on tracks with no OEM.
{
  const slash = classifyRow(track({ vendorPn: 'TSA/SY400X86CNX52/323E' }));
  assert.equal('reason' in slash ? null : slash.magPartId, 'SY400X86CNX52/323E', 'separators are kept');

  assert.equal(trackWarehouseNumber(track({ vendorPn: 'TSA/SY320X86X50C' })), 'SY320X86X50C');
  assert.equal(trackWarehouseNumber(track({ vendorPn: 'SY320X86X50C' })), null, 'no TSA/ wrapper, no guess');
  assert.equal(trackWarehouseNumber(track({ vendorPn: 'TSA/' })), null);
  assert.equal(trackWarehouseNumber(track({ vendorPn: null })), null);
  assert.equal(
    trackWarehouseNumber(track({ vendorPn: 'TSA/SY400X86X49C', oem: '7316759' })),
    null,
    'a track that has an OEM keeps its OEM page'
  );
  assert.equal(
    trackWarehouseNumber({ ...track({ vendorPn: 'TSA/SY320X86X50C' }), category_slug: 'jcb-general' }),
    null,
    'only the rubber-tracks category is read this way'
  );

  const noNumber = classifyRow(track({ vendorPn: null }));
  assert.equal('reason' in noNumber && noNumber.reason === 'no_mappable_oem', true);

  const retired = classifyRow(track({ vendorPn: 'TSA/SY84914', missCount: 3 }));
  assert.equal('reason' in retired && retired.reason === 'url_retired', true);

  // Seven SKUs on one belt are one page read. Buy Now wins, then the higher sticker.
  const sharers = [
    trackCandidate({ vendorPn: 'TSA/SY320X86X50C', price: 999 }),
    trackCandidate({ vendorPn: 'TSA/SY320X86X50C', price: 1049 }),
    trackCandidate({ vendorPn: 'TSA/SY320X86X50C', price: 2000, salesType: 'quote_only' }),
    trackCandidate({ vendorPn: 'TSA/SY320X86X50Z', price: 999 }),
  ];
  const { unique, duplicates } = dedupeCandidates(sharers);
  assert.deepEqual(
    unique.map((c) => `${c.warehouseNumber}@${c.row.price}`).sort(),
    ['SY320X86X50C@1049', 'SY320X86X50Z@999']
  );
  assert.equal(duplicates.length, 2);
}

// Sell-out slice: live tracks that are low or have no count of their own go first.
{
  const unread = trackCandidate({ vendorPn: 'TSA/SY84914' });
  const inheritedOnly = trackCandidate({ vendorPn: 'TSA/SY320X86X50C', qty: 66, lastCheckedAt: '2026-11-10T14:00:00.000Z' });
  const ownHealthy = trackCandidate({ vendorPn: 'TSA/SY450X86X58C', qty: 30, stockOnly: true, lastCheckedAt: '2026-11-09T14:00:00.000Z' });
  const ownLow = trackCandidate({ vendorPn: 'TSA/SY84988', qty: 3, stockOnly: true, lastCheckedAt: '2026-11-08T14:00:00.000Z' });
  const ownSoldOut = trackCandidate({ vendorPn: 'TSA/SY84940', qty: null, stockOnly: true, lastCheckedAt: '2026-11-07T14:00:00.000Z' });
  const quoteTrack = trackCandidate({ vendorPn: 'TSA/SY84945', salesType: 'quote_only' });

  assert.equal(isTrackSellOutWatch(unread), true, 'never read');
  assert.equal(isTrackSellOutWatch(inheritedOnly), true, 'a count inherited by size is not its own reading');
  assert.equal(isTrackSellOutWatch(ownLow), true);
  assert.equal(isTrackSellOutWatch(ownSoldOut), true, 'sold out and still live waits on a pull decision');
  assert.equal(isTrackSellOutWatch(ownHealthy), false, 'a healthy track rotates with the high-ticket rows');
  assert.equal(isTrackSellOutWatch(quoteTrack), false, 'quote-only tracks are not in the sell-out slice');
  assert.equal(needsLowQtyRefresh(ownHealthy), false);
  assert.equal(needsLowQtyRefresh(unread), true);

  const lowSwitch = candidate({ price: 40, qty: 1, oem: '333/LOWSW', lastCheckedAt: '2020-01-01T00:00:00.000Z' });
  const highTicket = candidate({ price: 900, qty: 30, oem: '333/HIGHT', lastCheckedAt: '2020-01-02T00:00:00.000Z' });
  const budgeted = selectBudgetedWatchQueue(
    [highTicket, lowSwitch, ownHealthy, ownSoldOut, ownLow, inheritedOnly, unread, quoteTrack],
    DAILY_PAGE_BUDGET
  );
  assert.deepEqual(
    budgeted.lowQty.map((c) => c.warehouseNumber ?? c.oem),
    ['SY84914', 'SY84940', 'SY84988', 'SY320X86X50C', '333/LOWSW'],
    'tracks lead the sell-out slice, stalest first, ahead of an older low-qty switch'
  );
  assert.deepEqual(
    budgeted.buyNow.map((c) => c.warehouseNumber ?? c.oem),
    ['333/HIGHT', 'SY450X86X58C'],
    'a healthy track waits its turn in the high-ticket rotation'
  );
  assert.deepEqual(budgeted.stubs.map((c) => c.warehouseNumber), ['SY84945']);

  // The tracks do not add pages. They take slots inside the same reserve and budget.
  const crowd: WatchCandidate[] = [];
  for (let i = 0; i < 32; i++) crowd.push(trackCandidate({ vendorPn: `TSA/SY${90000 + i}` }));
  for (let i = 0; i < 118; i++) crowd.push(candidate({ price: 40, qty: 1, oem: `333/L${5000 + i}`, lastCheckedAt: '2026-01-01T00:00:00.000Z' }));
  for (let i = 0; i < 200; i++) crowd.push(candidate({ price: 800, qty: 20, oem: `333/H${6000 + i}`, lastCheckedAt: '2026-02-01T00:00:00.000Z' }));
  const pages = DAILY_PAGE_BUDGET - HERO_FETCH_RESERVE;
  const dayOne = selectBudgetedWatchQueue(crowd, pages);
  assert.equal(dayOne.queue.length, pages);
  assert.equal(dayOne.lowQty.length, LOW_QTY_DAILY_RESERVE);
  assert.equal(dayOne.lowQty.filter((c) => c.warehouseNumber).length, 32);
  assert.equal(dayOne.lowQty.slice(0, 32).every((c) => c.warehouseNumber !== null), true);
}

{
  const pool: WatchCandidate[] = [];
  for (let i = 0; i < 50; i++) {
    pool.push(candidate({ price: 40, qty: 1, oem: `333/C${3000 + i}`, lastCheckedAt: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T00:00:00.000Z` }));
  }
  for (let i = 0; i < 60; i++) {
    pool.push(candidate({ price: 800, qty: 20, oem: `333/A${4000 + i}`, lastCheckedAt: `2026-02-${String((i % 28) + 1).padStart(2, '0')}T00:00:00.000Z` }));
  }
  pool.push(candidate({ price: 0, salesType: 'quote_only', oem: '333/STUB1', queueRank: 1 }));
  const budgeted = selectBudgetedWatchQueue(pool, DAILY_PAGE_BUDGET);
  assert.equal(budgeted.queue.length, DAILY_PAGE_BUDGET);
  assert.equal(budgeted.lowQty.length, LOW_QTY_DAILY_RESERVE);
  assert.equal(budgeted.buyNow.length, DAILY_PAGE_BUDGET - LOW_QTY_DAILY_RESERVE);
  assert.equal(budgeted.stubs.length, 0, 'stubs wait while high-ticket still needs pages');
  assert.equal(new Set(budgeted.queue.map((c) => c.identityKey)).size, DAILY_PAGE_BUDGET);
  assert.deepEqual(
    budgeted.queue.slice(0, LOW_QTY_DAILY_RESERVE).map((c) => c.identityKey),
    budgeted.lowQty.map((c) => c.identityKey)
  );
}

{
  const open = selectBudgetedWatchQueue(
    [
      candidate({ price: 40, qty: 1, oem: '333/LOW1', lastCheckedAt: '2026-09-01T00:00:00.000Z' }),
      candidate({ price: 900, qty: 30, oem: '333/HIGH1', lastCheckedAt: '2026-09-02T00:00:00.000Z' }),
      candidate({ price: 0, salesType: 'quote_only', oem: '333/STUB9', queueRank: 1 }),
    ],
    90
  );
  assert.deepEqual(
    open.queue.map((c) => c.oem),
    ['333/LOW1', '333/HIGH1', '333/STUB9']
  );
}

{
  const noLow = selectBudgetedWatchQueue(
    [
      candidate({ price: 40, qty: 1, oem: '333/LOW2' }),
      candidate({ price: 900, qty: 30, oem: '333/HIGH2' }),
    ],
    90,
    { includeLowQty: false }
  );
  assert.equal(noLow.lowQty.length, 0);
  assert.deepEqual(noLow.queue.map((c) => c.oem), ['333/HIGH2']);
}

console.log('magWatchUniverse.test.ts: ok');
