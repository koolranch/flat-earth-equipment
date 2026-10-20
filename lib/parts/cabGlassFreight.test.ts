import assert from 'node:assert/strict';
import {
  cabGlassFreightCents,
  cabGlassLinesCostDollars,
  cabGlassOrderFreightCents,
  isCabGlassCheckoutItem,
} from './cabGlassFreight';

assert.equal(cabGlassFreightCents(0), 0);
assert.equal(cabGlassFreightCents(1.74), 1800);
assert.equal(cabGlassFreightCents(22), 1800);
assert.equal(cabGlassFreightCents(79), 2500);
assert.equal(cabGlassFreightCents(149.99), 2500);
assert.equal(cabGlassFreightCents(180), 3100);
assert.equal(cabGlassFreightCents(309), 3700);
assert.equal(cabGlassFreightCents(429), 3700);
assert.equal(cabGlassFreightCents(649.99), 4100);
assert.equal(cabGlassFreightCents(1437.35), 4100);
assert.equal(cabGlassFreightCents(1669), 4100);

assert.equal(cabGlassOrderFreightCents({ sellDollars: 1669, costDollars: null }), 4100);
assert.equal(cabGlassOrderFreightCents({ sellDollars: 1669, costDollars: 500 }), 4100);
assert.equal(cabGlassOrderFreightCents({ sellDollars: 1669, costDollars: 650 }), 0);
assert.equal(cabGlassOrderFreightCents({ sellDollars: 79, costDollars: 61.75 }), 2500);

assert.equal(
  cabGlassLinesCostDollars([
    { quantity: 1, metadata: { cost_wholesale: 400 } },
    { quantity: 1, metadata: {} },
  ]),
  null,
);
assert.equal(
  cabGlassLinesCostDollars([
    { quantity: 1, metadata: { cost_wholesale: 400 } },
    { quantity: 2, metadata: { cost_wholesale: 200 } },
  ]),
  800,
);

assert.equal(isCabGlassCheckoutItem({ category: 'Cab Glass' }), true);
assert.equal(isCabGlassCheckoutItem({ metadata: { category_slug: 'cab-glass' } }), true);
assert.equal(isCabGlassCheckoutItem({ category: 'JCB Parts' }), false);

console.log('cabGlassFreight tests passed');
