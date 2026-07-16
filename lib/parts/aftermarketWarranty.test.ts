import assert from 'node:assert/strict';
import {
  getEffectiveWarrantyMonths,
  qualifiesForTwoYearAftermarketWarranty,
} from './aftermarketWarranty';

assert.equal(
  qualifiesForTwoYearAftermarketWarranty({
    brand: 'JCB',
    category: 'JCB Hoses',
    category_slug: 'jcb-hoses',
    name: 'JCB 332/D2199 Aftermarket Twin Hose Assembly',
  }),
  true,
);

assert.equal(
  qualifiesForTwoYearAftermarketWarranty({
    brand: 'Bobcat',
    category: 'Seal Kits',
    category_slug: 'seal-kits',
    name: 'Bobcat seal kit',
  }),
  true,
);

assert.equal(
  qualifiesForTwoYearAftermarketWarranty({
    brand: 'Toyota',
    category: 'Hydraulics',
    category_slug: 'hydraulics',
    name: 'Toyota lift cylinder',
  }),
  true,
);

assert.equal(
  qualifiesForTwoYearAftermarketWarranty({
    brand: 'Bobcat',
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    name: 'Bobcat T650 rubber track',
  }),
  true,
);

assert.equal(
  qualifiesForTwoYearAftermarketWarranty({
    brand: 'Curtis',
    category: 'Controllers',
    category_slug: 'controllers',
    name: 'Curtis motor controller',
    has_core_charge: true,
    core_charge: 250,
  }),
  false,
);

assert.equal(
  qualifiesForTwoYearAftermarketWarranty({
    brand: 'Flat Earth Equipment',
    category: 'Battery Chargers',
    category_slug: 'battery-chargers',
    name: '24V forklift battery charger',
  }),
  false,
);

assert.equal(
  getEffectiveWarrantyMonths({
    brand: 'JCB',
    category: 'JCB General Parts',
    category_slug: 'jcb-general',
    name: 'JCB pin',
  }),
  24,
);

assert.equal(
  getEffectiveWarrantyMonths({
    brand: 'Genie',
    category: 'Controllers',
    category_slug: 'controllers',
    name: 'Genie ground control box',
    has_core_charge: true,
    core_charge: 250,
    metadata: { warranty_months: 24 },
  }),
  null,
);

console.log('aftermarketWarranty tests passed');
