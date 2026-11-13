import assert from 'node:assert/strict';
import {
  isTrackBeltName,
  isTrackListing,
  normalizeTrackSize,
  trackPatternFromText,
  trackPatternFromVendorPn,
  trackWarehouseKey,
  warehouseNumberFromVendorPn,
} from './trackWarehouseKey';

assert.equal(normalizeTrackSize('320x86x50 C Pattern'), '320x86x50');
assert.equal(normalizeTrackSize('TRACK - RUBBER 450X81.5X78 MINI EX'), '450x81.5x78');
assert.equal(normalizeTrackSize('pump housing'), null);

assert.equal(isTrackBeltName('JCB 190T Rubber Track 320x86x50 C Pattern'), true);
assert.equal(isTrackBeltName('TRACK - RUBBER 320X86X50 B-STYLE, C PATTERN'), true);
assert.equal(isTrackBeltName('8T IDLER GA RUBBER TRACK'), false);
assert.equal(isTrackBeltName('JCB 333/D8766 Filter'), false);

assert.equal(trackPatternFromText('B-Style, C Pattern'), 'c');
assert.equal(trackPatternFromText('320x86x48 Block Tread'), 'block');
assert.equal(trackPatternFromText('Zig-Zag Pattern'), 'zigzag');
assert.equal(trackPatternFromVendorPn('TSA/SY320X86X50C'), 'c');
assert.equal(trackPatternFromVendorPn('TSA/SY320X86X50Z'), 'zigzag');
assert.equal(trackPatternFromVendorPn('TSA/SY84988'), null);

assert.equal(
  trackWarehouseKey({
    name: 'JCB 331/55510 Track - Rubber 320X86X50 B-Style, C Pattern',
    magTitle: 'TRACK - RUBBER 320X86X50 B-STYLE, C PATTERN',
  }),
  '320x86x50|c'
);
assert.equal(
  trackWarehouseKey({
    categorySlug: 'rubber-tracks',
    name: 'JCB 1CXT Rubber Track 320x86x50 C Pattern',
    vendorPn: 'TSA/SY320X86X50C',
  }),
  '320x86x50|c'
);
assert.equal(
  trackWarehouseKey({
    categorySlug: 'rubber-tracks',
    name: 'Bobcat T66 Rubber Track 320x86x50 Zig-Zag Pattern',
    vendorPn: 'TSA/SY320X86X50Z',
  }),
  '320x86x50|zigzag'
);
assert.equal(
  trackWarehouseKey({
    name: 'JCB 334/S3146 8T IDLER GA RUBBER TRACK',
    categorySlug: 'jcb-undercarriage',
  }),
  null
);
assert.equal(
  trackWarehouseKey({ name: 'JCB 333/D8766 Fuel Filter', categorySlug: 'jcb-general' }),
  null
);

assert.equal(isTrackListing({ name: 'Bobcat T66 Track', category_slug: 'rubber-tracks' }), true);
assert.equal(
  isTrackListing({ name: 'JCB 331/55510 Track - Rubber 320X86X50', category_slug: 'jcb-general' }),
  true,
  'an OEM-numbered belt on another shelf is still a track'
);
assert.equal(
  isTrackListing({ name: 'JCB 334/S3146 8T IDLER GA RUBBER TRACK', category_slug: 'jcb-undercarriage' }),
  false
);
assert.equal(isTrackListing({ name: 'JCB 333/D8766 Fuel Filter', category_slug: 'jcb-general' }), false);

// The warehouse number is the vendor number with its wrapper removed. Nothing is added.
assert.equal(warehouseNumberFromVendorPn('TSA/SY320X86X50C'), 'SY320X86X50C');
assert.equal(warehouseNumberFromVendorPn(' tsa/sy320x86x50c '), 'SY320X86X50C');
assert.equal(warehouseNumberFromVendorPn('TSA/SY400X86CNX52/323E'), 'SY400X86CNX52/323E', 'separators stay');
assert.equal(warehouseNumberFromVendorPn('TSA/SY380X86X52SVL65-2'), 'SY380X86X52SVL65-2');
assert.equal(warehouseNumberFromVendorPn('SY320X86X50C'), null, 'no wrapper, no guess');
assert.equal(warehouseNumberFromVendorPn('TSA/'), null);
assert.equal(warehouseNumberFromVendorPn(null), null);
assert.equal(warehouseNumberFromVendorPn(undefined), null);

console.log('trackWarehouseKey.test.ts passed');
