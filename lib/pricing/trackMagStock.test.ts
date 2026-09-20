import assert from 'node:assert/strict';
import {
  applyTrackFanOutMetadata,
  isRubberTrackCategory,
  isTrackStockRow,
  pullCapIdentity,
  shouldReceiveTrackFanOut,
  trackFanOutTargets,
  warehouseKeyForRow,
} from './trackMagStock';
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

assert.equal(shouldReceiveTrackFanOut(oemStub, modelPdp), true);
assert.equal(shouldReceiveTrackFanOut(oemStub, zigzag), false);
assert.equal(shouldReceiveTrackFanOut(oemStub, otherOem), false, 'other OEM stub keeps its own Mag URL');
assert.equal(shouldReceiveTrackFanOut(oemStub, oemStub), false);

assert.deepEqual(
  trackFanOutTargets(oemStub, [oemStub, modelPdp, zigzag, otherOem]).map((r) => r.sku),
  ['RT-JCB1CXT-320X86X50-C']
);

assert.equal(pullCapIdentity(modelPdp), '320x86x50|c');
assert.equal(pullCapIdentity(zigzag), '320x86x50|zigzag');

const inherited = applyTrackFanOutMetadata(modelPdp, oemStub, {
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
assert.equal(inherited.vendor_pn, 'TSA/SY320X86X50C');

console.log('trackMagStock.test.ts passed');
