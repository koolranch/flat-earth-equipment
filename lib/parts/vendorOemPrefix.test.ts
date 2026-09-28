import assert from 'node:assert/strict';
import { getCustomerPartNumber } from './vendorOemPrefix';

assert.equal(
  getCustomerPartNumber({ sku: 'FEE-F3-016', brand: 'Flat Earth Equipment' }),
  '',
  'house fork SKU stays off the PDP'
);

assert.equal(
  getCustomerPartNumber({
    sku: 'FEE-F3-016',
    oemReference: 'FORK-4160',
    brand: 'Helmar',
  }),
  '',
  'Helmar catalog number stays off the PDP'
);

assert.equal(
  getCustomerPartNumber({
    sku: 'FEE-F3-016',
    oemReference: '333/C3422',
    brand: 'JCB',
  }),
  '333/C3422',
  'a real OEM number still shows'
);
