import assert from 'node:assert/strict';
import {
  getWholesaleCostUsd,
  qualifiesForSeatFreeFreight,
  SEAT_FREE_FREIGHT_COST_USD,
} from './seatFreight';

assert.equal(SEAT_FREE_FREIGHT_COST_USD, 650);

assert.equal(getWholesaleCostUsd({ cost_wholesale: 700 }), 700);
assert.equal(getWholesaleCostUsd({ cost_wholesale: '928.3' }), 928.3);
assert.equal(getWholesaleCostUsd({}), null);

assert.equal(
  qualifiesForSeatFreeFreight('Seats', { free_freight: true }),
  true
);
assert.equal(
  qualifiesForSeatFreeFreight('Seats', { cost_wholesale: 650 }),
  true
);
assert.equal(
  qualifiesForSeatFreeFreight('Seats', { cost_wholesale: 649.99 }),
  false
);
assert.equal(
  qualifiesForSeatFreeFreight('Seat cushions', { cost_wholesale: 900 }),
  false
);
assert.equal(qualifiesForSeatFreeFreight('Seats', {}), false);

console.log('seatFreight.test.ts: all assertions passed');
