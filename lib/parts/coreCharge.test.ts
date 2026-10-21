import assert from 'node:assert/strict';
import { clientCoreCents, coreChargeCents, resolveCheckoutCoreCents } from './coreCharge';

assert.equal(coreChargeCents(null), 0);
assert.equal(coreChargeCents({ has_core_charge: false, core_charge: 200 }), 0);
assert.equal(coreChargeCents({ has_core_charge: true, core_charge: 0 }), 0);
assert.equal(coreChargeCents({ has_core_charge: true, core_charge: '200.00' }), 20000);
assert.equal(coreChargeCents({ has_core_charge: true, core_charge: 350 }), 35000);

assert.equal(clientCoreCents(undefined), 0);
assert.equal(clientCoreCents(''), 0);
assert.equal(clientCoreCents('200'), 20000);

const other = { cents: 20000, sku: '1206HB-5201', name: 'Curtis 1206HB' };
assert.equal(resolveCheckoutCoreCents(other, undefined), 20000);
assert.equal(resolveCheckoutCoreCents(other, 50), 20000);
assert.equal(resolveCheckoutCoreCents(undefined, 200), 20000);

const sold = { cents: 40000, sku: '1206AC5201', name: 'Curtis 1206AC5201' };
assert.equal(resolveCheckoutCoreCents(sold, undefined), 40000);
assert.equal(resolveCheckoutCoreCents(sold, 350), 40000);

console.log('coreCharge tests passed');
