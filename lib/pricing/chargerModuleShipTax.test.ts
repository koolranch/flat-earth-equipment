import assert from 'node:assert/strict';
import { CHARGER_MODULES } from '../../constants/chargerOptions';
import {
  chargerModuleWholesaleCents,
  shipTaxPerUnitCents,
  shipToStateName,
  US_SHIP_TO_STATES,
} from './chargerModuleShipTax';

const HAWKER_REMAN = 'price_1TVz7eHJI548rO8JLoKh6iIk';
const ACT_36_REMAN = 'price_1TWyysHJI548rO8JuLkbioA4';
const ACT_36_REPAIR = 'price_1TWyysHJI548rO8JTuY3l7cN';

assert.equal(shipToStateName('mi'), 'Michigan');
assert.equal(shipToStateName('ZZ'), null);
assert.equal(US_SHIP_TO_STATES.length, 51);

// 6% of $526 = $31.56. Four units = $126.24.
assert.equal(shipTaxPerUnitCents(HAWKER_REMAN, 'MI'), 3156);
assert.equal(shipTaxPerUnitCents(HAWKER_REMAN, 'MI')! * 4, 12624);

// 6% of $513 ACT reman = $30.78.
assert.equal(shipTaxPerUnitCents(ACT_36_REMAN, 'MI'), 3078);

// Oregon has no state sales tax.
assert.equal(shipTaxPerUnitCents(HAWKER_REMAN, 'OR'), 0);

// ACT repair has no wholesale cost on file.
assert.equal(chargerModuleWholesaleCents(ACT_36_REPAIR), null);
assert.equal(shipTaxPerUnitCents(ACT_36_REPAIR, 'MI'), null);
assert.equal(shipTaxPerUnitCents('price_unknown', 'MI'), null);
assert.equal(shipTaxPerUnitCents(HAWKER_REMAN, 'ZZ'), null);

for (const charger of CHARGER_MODULES) {
  for (const offer of charger.offers) {
    const cost = chargerModuleWholesaleCents(offer.sku);
    const isActRepair = charger.brand === 'ACT' && offer.label === 'Repair & Return';
    if (isActRepair) {
      assert.equal(cost, null, offer.sku);
    } else {
      assert.ok(cost && cost > 0, `${charger.slug} ${offer.label} needs a wholesale cost`);
    }
  }
}
