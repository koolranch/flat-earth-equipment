import assert from 'node:assert/strict';
import {
  applyTrackFanOutMetadata,
  applyTrackStockRead,
  isCountedTrackRead,
  isRubberTrackCategory,
  isTrackStockRow,
  pullCapIdentity,
  shouldReceiveTrackFanOut,
  trackFanOutTargets,
  trackNumberSharers,
  warehouseKeyForRow,
  type TrackStockRead,
} from './trackMagStock';
import { parseMagSnapshot, type MagSnapshot } from './magSnapshot';
import type { WatchRow } from './magWatchUniverse';

let n = 0;
function row(over: Partial<WatchRow> = {}): WatchRow {
  n++;
  return {
    id: `id-${n}`,
    sku: over.sku ?? `SKU${n}`,
    slug: `slug-${n}`,
    name: 'Part',
    brand: 'JCB',
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    sales_type: 'direct',
    is_in_stock: true,
    price: 999,
    price_cents: 99900,
    oem_reference: null,
    stripe_price_id: 'price_live',
    stripe_product_id: 'prod_live',
    image_url: null,
    metadata: {},
    ...over,
  };
}

const oemStub = row({
  sku: '33155510',
  name: 'JCB 331/55510 Track - Rubber 320X86X50 B-Style, C Pattern',
  category: 'JCB General Parts',
  category_slug: 'jcb-general',
  oem_reference: '331/55510',
  metadata: {
    vendor_pn: 'JC331/55510',
    competitor_prices: [
      { source: 'magnasource', title: 'TRACK - RUBBER 320X86X50 B-STYLE, C PATTERN', qty_on_hand: 89 },
    ],
  },
});

const modelPdp = row({
  sku: 'RT-JCB1CXT-320X86X50-C',
  name: 'JCB 1CXT Rubber Track 320x86x50 C Pattern',
  metadata: { vendor_pn: 'TSA/SY320X86X50C', cost_wholesale: 820, free_freight: true },
});

const zigzag = row({
  sku: 'RT-T66-320X86X50-Z',
  name: 'Bobcat T66 Rubber Track 320x86x50 Zig-Zag Pattern',
  brand: 'Bobcat',
  metadata: { vendor_pn: 'TSA/SY320X86X50Z' },
});

const otherOem = row({
  sku: '333L4920',
  name: 'JCB 333/L4920 Track - Rubber 320X86X50 B-Style C Pattern',
  category: 'JCB General Parts',
  category_slug: 'jcb-general',
  oem_reference: '333/L4920',
});

assert.equal(isRubberTrackCategory(modelPdp), true);
assert.equal(isTrackStockRow(oemStub), true);
assert.equal(warehouseKeyForRow(oemStub), '320x86x50|c');
assert.equal(warehouseKeyForRow(modelPdp), '320x86x50|c');
assert.equal(warehouseKeyForRow(zigzag), '320x86x50|zigzag');

// A model PDP that carries the OEM belt's number has no page of its own, so it inherits.
const oemModelPdp = row({
  sku: 'RT-JCB3TS-320X86X50-C',
  name: 'JCB 3TS Rubber Track 320x86x50 C Pattern',
  oem_reference: '331/55510',
  metadata: { vendor_pn: 'JC331/55510', cost_wholesale: 820, free_freight: true },
});

assert.equal(shouldReceiveTrackFanOut(oemStub, oemModelPdp), true);
assert.equal(
  shouldReceiveTrackFanOut(oemStub, modelPdp),
  false,
  'a track with its own warehouse number is read from that page only'
);
assert.equal(shouldReceiveTrackFanOut(modelPdp, oemModelPdp), false, 'and its reading stays on its own number');
assert.equal(shouldReceiveTrackFanOut(oemStub, zigzag), false);
assert.equal(shouldReceiveTrackFanOut(oemStub, otherOem), false, 'other OEM stub keeps its own Mag URL');
assert.equal(shouldReceiveTrackFanOut(oemStub, oemStub), false);

assert.deepEqual(
  trackFanOutTargets(oemStub, [oemStub, oemModelPdp, modelPdp, zigzag, otherOem]).map((r) => r.sku),
  ['RT-JCB3TS-320X86X50-C']
);
assert.deepEqual(trackFanOutTargets(modelPdp, [oemStub, oemModelPdp, modelPdp, zigzag]), []);

assert.equal(pullCapIdentity(modelPdp), '320x86x50|c');
assert.equal(pullCapIdentity(zigzag), '320x86x50|zigzag');

const inherited = applyTrackFanOutMetadata(oemModelPdp, oemStub, {
  competitor_prices: [
    { source: 'magnasource', title: 'TRACK - RUBBER 320X86X50 B-STYLE, C PATTERN', qty_on_hand: 0, availability: 'backorder' },
  ],
  mag_watch: {
    url: 'https://www.magnasourceinc.com/itemdetail/JC331/55510',
    last_checked_at: '2026-09-19T12:00:00.000Z',
    last_availability: 'backorder',
    sold_out_streak: 2,
  },
});
assert.equal((inherited.mag_watch as { inherited_from_sku: string }).inherited_from_sku, '33155510');
assert.equal((inherited.mag_watch as { sold_out_streak: number }).sold_out_streak, 2);
assert.equal(inherited.cost_wholesale, 820);
assert.equal(inherited.free_freight, true);
assert.equal(inherited.vendor_pn, 'JC331/55510');

// --- Read by warehouse number -------------------------------------------------------

const NUMBER = 'SY320X86X50C';
const NUMBER_URL = `https://www.magnasourceinc.com/itemdetail/${NUMBER}`;

function page(number: string, stock: string): string {
  return `# TRACK - RUBBER 320X86X50 B-STYLE, C PATTERN\n\n## 320X86X50C for TVH\n\n### Part Number: ${number}\n\n${stock}\n\nInventory availability confirmed by supplier at 11/10/2026 9:02:27 PM\n\nTOTAL PRICE\n\n$1,210.88\n\nWeight:\n\n346.1258 lbs.\n`;
}

function read(snapshot: MagSnapshot, at = '2026-11-11T14:00:00.000Z'): TrackStockRead {
  return { warehouseNumber: NUMBER, url: NUMBER_URL, snapshot, at };
}

const inStock = parseMagSnapshot(page(NUMBER, '66 on hand and ready to ship today'), {
  magPartId: NUMBER,
  brand: null,
});
const soldOut = parseMagSnapshot(page(NUMBER, '0 on hand'), { magPartId: NUMBER, brand: null });
const wrongNumber = parseMagSnapshot(page('SY320X86X50Z', '0 on hand'), {
  magPartId: NUMBER,
  brand: null,
});
const invalidPage = parseMagSnapshot(
  `### Part Number: ${NUMBER}\n\nSorry, the requested item is no longer valid.`,
  { magPartId: NUMBER, brand: null }
);

assert.equal(isCountedTrackRead(inStock), true);
assert.equal(isCountedTrackRead(soldOut), true);
assert.equal(isCountedTrackRead(wrongNumber), false, 'a page showing another number is unread');
assert.equal(isCountedTrackRead(invalidPage), false, 'HTTP 200 on a dead item is unread');

// The seven-SKU belt from the catalog, cut down to three, plus neighbours that must not share.
const sharerA = row({
  sku: 'RT-T66-320X86X50-C',
  brand: 'Bobcat',
  name: 'Bobcat T66 Rubber Track 320x86x50 C Pattern',
  metadata: { vendor_pn: 'tsa/sy320x86x50c' },
});
const sharerRetired = row({
  sku: 'RT-317G-320X86X50-C',
  brand: 'John Deere',
  name: 'John Deere 317G Rubber Track 320x86x50 C Pattern',
  metadata: { vendor_pn: 'TSA/SY320X86X50C', mag_watch: { miss_count: 3 } },
});
const sameSizeWithOem = row({
  sku: 'RT-OEM-320X86X50-C',
  name: 'JCB Rubber Track 320x86x50 C Pattern',
  oem_reference: '331/55510',
  metadata: { vendor_pn: 'TSA/SY320X86X50C' },
});
assert.deepEqual(
  trackNumberSharers(modelPdp, [modelPdp, sharerA, zigzag, sharerRetired, sameSizeWithOem, oemStub]).map(
    (r) => r.sku
  ),
  ['RT-T66-320X86X50-C', 'RT-317G-320X86X50-C'],
  'same number only: not the zig-zag, not the OEM-numbered row, and retired sharers still count'
);
assert.deepEqual(trackNumberSharers(oemStub, [modelPdp, sharerA]), []);

// A counted reading writes stock and nothing a price or photo decision could use.
const priced = row({
  sku: 'RT-JCB190T-320X86X50-C',
  name: 'JCB 190T Rubber Track 320x86x50 C Pattern',
  metadata: {
    vendor_pn: 'TSA/SY320X86X50C',
    cost_wholesale: 820,
    free_freight: true,
    competitor_prices: [
      { source: 'trackcomp', price: 1100 },
      // What these rows hold today: an OEM page's reading, copied over by size.
      { source: 'magnasource', price: 1479, title: 'TRACK - RUBBER 320X86X50', qty_on_hand: 66, availability: 'in_stock' },
    ],
    mag_watch: {
      last_checked_at: '2026-11-10T14:00:00.000Z',
      last_availability: 'in_stock',
      inherited_from_sku: '333L4920',
      miss_count: 2,
      hero: { filename: 'kept.jpg' },
    },
  },
});
const counted = applyTrackStockRead(priced, read(inStock));
const countedComps = counted.competitor_prices as Array<Record<string, unknown>>;
assert.deepEqual(countedComps[0], { source: 'trackcomp', price: 1100 }, 'other comps are untouched');
assert.deepEqual(countedComps[1], {
  source: 'magnasource',
  url: NUMBER_URL,
  fetched_at: '2026-11-11T14:00:00.000Z',
  availability: 'in_stock',
  qty_on_hand: 66,
  qty_is_floor: false,
  supplier_confirmed_at: '11/10/2026 9:02:27 PM',
  backorder_eta: null,
  stock_only: true,
});
assert.equal('price' in countedComps[1], false, 'the warehouse sticker is never stored on a track');
assert.equal('weight_lb' in countedComps[1], false);
assert.deepEqual(counted.mag_watch, {
  last_checked_at: '2026-11-11T14:00:00.000Z',
  last_availability: 'in_stock',
  miss_count: 0,
  hero: { filename: 'kept.jpg' },
  url: NUMBER_URL,
  warehouse_number: NUMBER,
  sold_out_streak: 0,
});
assert.equal(counted.cost_wholesale, 820);
assert.equal(counted.free_freight, true);
assert.equal(counted.vendor_pn, 'TSA/SY320X86X50C');

// The same reading lands on a sharer, tagged with the SKU whose page read it was.
const shared = applyTrackStockRead(sharerA, read(soldOut), 'RT-JCB190T-320X86X50-C');
const sharedWatch = shared.mag_watch as Record<string, unknown>;
assert.equal(sharedWatch.last_availability, 'backorder');
assert.equal(sharedWatch.sold_out_streak, 1);
assert.equal(sharedWatch.inherited_from_sku, 'RT-JCB190T-320X86X50-C');
assert.equal((shared.competitor_prices as Array<Record<string, unknown>>)[0].qty_on_hand, 0);

// Unread: the last counted reading and its date stand. Only the miss counter moves.
for (const unread of [wrongNumber, invalidPage]) {
  const missed = applyTrackStockRead(priced, read(unread, '2026-11-12T14:00:00.000Z'));
  assert.deepEqual(missed.competitor_prices, priced.metadata?.competitor_prices);
  const missedWatch = missed.mag_watch as Record<string, unknown>;
  assert.equal(missedWatch.last_checked_at, '2026-11-10T14:00:00.000Z');
  assert.equal(missedWatch.last_availability, 'in_stock', 'a mismatch is not sold out');
  assert.equal(missedWatch.sold_out_streak, undefined);
  assert.equal(missedWatch.miss_count, 3);
  assert.equal(missedWatch.last_miss_at, '2026-11-12T14:00:00.000Z');
}
assert.equal(
  (applyTrackStockRead(priced, read(wrongNumber)).mag_watch as Record<string, unknown>).last_miss_reason,
  'part_number_mismatch:SY320X86X50Z'
);
assert.equal(
  (applyTrackStockRead(priced, read(invalidPage)).mag_watch as Record<string, unknown>).last_miss_reason,
  'page_reports_item_not_valid'
);

console.log('trackMagStock.test.ts passed');
