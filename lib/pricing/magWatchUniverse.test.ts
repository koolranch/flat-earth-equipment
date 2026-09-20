import assert from 'node:assert/strict';
import {
  classifyRow,
  lastMagQty,
  needsLowQtyRefresh,
  selectWatchQueue,
  tiersDue,
  DEFAULT_QUOTE_CAP,
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
    },
  };
}

function candidate(over: Parameters<typeof row>[0]): WatchCandidate {
  const classified = classifyRow(row(over));
  if ('reason' in classified) throw new Error(`unexpected skip ${classified.reason}`);
  return classified;
}

assert.equal(LOW_QTY_REFRESH_MAX, 3);
assert.equal(LOW_QTY_REFRESH_CAP, 80);
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

  const sizeOnly = classifyRow({
    ...row({ price: 999, oem: '' }),
    category_slug: 'rubber-tracks',
    oem_reference: null,
    name: 'JCB 1CXT Rubber Track 320x86x50 C Pattern',
    metadata: { vendor_pn: 'TSA/SY320X86X50C' },
  });
  assert.equal('reason' in sizeOnly && sizeOnly.reason === 'no_mappable_oem', true);
}

console.log('magWatchUniverse.test.ts: ok');
