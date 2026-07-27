/**
 * Print charger-module Stripe price IDs for revenue baseline queries.
 *
 * Usage:
 *   npx tsx scripts/seo/charger-revenue-baseline.ts
 *
 * Then in Stripe Dashboard → Payments / or Supabase orders joined to line items,
 * filter by these price IDs for the last 90 days.
 */

import { CHARGER_MODULES } from '../../constants/chargerOptions';

console.log('Charger module Stripe price IDs (revenue attribution)\n');
console.log(
  `${'Brand'.padEnd(10)} ${'Part'.padEnd(16)} ${'Offer'.padEnd(18)} Price ID`
);
console.log('-'.repeat(88));

for (const m of CHARGER_MODULES) {
  for (const o of m.offers) {
    console.log(
      `${m.brand.padEnd(10)} ${m.partNumber.padEnd(16)} ${o.label.padEnd(18)} ${o.sku}`
    );
  }
}

console.log('\nGA4 events to filter in Explorations:');
console.log('  - charger_module_view');
console.log('  - charger_module_add_to_cart');
console.log('  - charger_module_begin_checkout');
console.log('  - charger_module_fleet_quote_open');
console.log('  - view_item / add_to_cart / begin_checkout (item_category = Charger Modules)');
console.log('\nRelated full charger PDP (not a module):');
console.log('  /parts/hyster-remanufactured-24v-battery-charger-4092995');
