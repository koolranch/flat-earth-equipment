import assert from 'node:assert/strict';
import {
  isFlatSkuFreight,
  skuFreightDollars,
  skuFreightQuantity,
} from './skuFreight';

const wheel = {
  category: 'Wheels',
  quantity: 2,
  metadata: { freight_cents: 2500, category_slug: 'wheels' },
};

assert.equal(isFlatSkuFreight(wheel), true);
assert.equal(skuFreightQuantity(wheel), 1);
assert.equal(skuFreightDollars(wheel), 25);

assert.equal(
  skuFreightDollars({
    category: 'Wheels',
    quantity: 1,
    metadata: { freight_cents: 2500 },
  }),
  25
);

assert.equal(
  skuFreightDollars({
    quantity: 2,
    metadata: { freight_cents: 3100, one_time_sale: true },
  }),
  31
);

assert.equal(
  skuFreightDollars({
    quantity: 2,
    metadata: { freight_cents: 2500, freight_flat: true },
  }),
  25
);

const liftCylinder = {
  category: 'Mitsubishi Parts',
  quantity: 2,
  metadata: { freight_cents: 15000 },
};
assert.equal(isFlatSkuFreight(liftCylinder), true);
assert.equal(skuFreightQuantity(liftCylinder), 1);
assert.equal(skuFreightDollars(liftCylinder), 150);

assert.equal(
  skuFreightDollars({
    category: 'Mitsubishi Parts',
    quantity: 2,
    metadata: { freight_cents: 15000, freight_per_unit: true },
  }),
  300
);

assert.equal(
  skuFreightQuantity({
    category: 'Wheels',
    quantity: 2,
    metadata: { freight_cents: 2500, freight_per_unit: true },
  }),
  2
);

assert.equal(skuFreightDollars({ quantity: 2, metadata: {} }), 0);

console.log('skuFreight.test.ts: all assertions passed');
