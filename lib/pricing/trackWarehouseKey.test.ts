import assert from 'node:assert/strict';
import {
  isTrackBeltName,
  normalizeTrackSize,
  trackPatternFromText,
  trackPatternFromVendorPn,
  trackWarehouseKey,
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

console.log('trackWarehouseKey.test.ts passed');
