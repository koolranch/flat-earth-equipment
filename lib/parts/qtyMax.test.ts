import assert from 'node:assert/strict';
import { qtyExceedsCatalogMax, qtyMaxFromMetadata } from './qtyMax';

assert.equal(qtyMaxFromMetadata(null), null);
assert.equal(qtyMaxFromMetadata({ qty_max: 1 }), 1);
assert.equal(qtyMaxFromMetadata({ qty_max: '1' }), 1);
assert.equal(qtyMaxFromMetadata({ qty_max: 0 }), null);
assert.equal(qtyMaxFromMetadata({ qty_max: 1.5 }), null);

assert.equal(
  qtyExceedsCatalogMax([{ priceId: 'price_handle', quantity: 1, metadata: { qty_max: 1 } }]),
  null,
);
assert.equal(
  qtyExceedsCatalogMax([{ priceId: 'price_handle', quantity: 2, metadata: { qty_max: 1 } }]),
  'Only 1 available.',
);
assert.equal(
  qtyExceedsCatalogMax([
    { priceId: 'price_handle', quantity: 1, metadata: { qty_max: 1 } },
    { priceId: 'price_handle', quantity: 1, metadata: { qty_max: 1 } },
  ]),
  'Only 1 available.',
);
assert.equal(
  qtyExceedsCatalogMax([{ priceId: 'price_other', quantity: 4, metadata: {} }]),
  null,
);

console.log('qtyMax tests passed');
