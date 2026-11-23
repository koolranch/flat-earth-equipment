import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { quoteCheckoutFreight } from './checkoutFreightQuote';
import {
  defaultFreightForItems,
  defaultFreightForSimpleItem,
  hasExistingFreightRule,
  isExcludedFreightType,
  type FreightLine,
} from './defaultFreight';

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function line(partial: FreightLine): FreightLine {
  return { quantity: 1, ...partial };
}

const led = line({
  name: 'Skyjack 137785 Red LED block',
  category: 'Switches & Sensors',
  price: 58,
});
const cable = line({
  name: 'Skyjack 119646 Assembly - Cable',
  category: 'Aerial Equipment Parts',
  price: 273,
});
const contact = line({
  name: 'Skyjack 147054 Contact block N.O.',
  category: 'Switches & Sensors',
  price: 4,
  metadata: { cost_wholesale: 1.89 },
});
const grease = line({
  name: 'JLG 88671008 Fitting - Grease 1/4-28 Straight',
  category: 'Aerial Equipment Parts',
  price: 1,
});
const jcb = line({
  name: 'JCB part',
  category: 'JCB General Parts',
  price: 86,
});
const glass = line({
  name: 'Kubota RD158-46450 Rear Window',
  category: 'Cab Glass',
  price: 141,
  metadata: { category_slug: 'cab-glass', cost_wholesale: 96.2 },
});
const charger800 = line({
  name: 'Battery charger',
  category: 'Battery Chargers',
  price: 800,
});
const heavy = line({
  name: 'Heavy part',
  category: 'Aerial Equipment Parts',
  price: 100,
  weight_lbs: 80,
});

const cases: Array<{ id: string; detail: string; cents: number; flag: string | null; name?: string }> = [];

function expectDecision(
  id: string,
  detail: string,
  items: FreightLine[],
  cents: number,
  flag: string | null,
  freightName?: string,
) {
  const decision = defaultFreightForItems(items);
  assert.equal(decision.unitAmountCents, cents, id);
  assert.equal(decision.freightFlag, flag, id);
  if (freightName) assert.equal(decision.name, freightName, id);
  cases.push({ id, detail, cents: decision.unitAmountCents, flag: decision.freightFlag, name: decision.name });
}

expectDecision('1', 'Skyjack 137785 Red LED block, $58, no cost', [led], 2700, null, 'Freight Shipping');
expectDecision('2', 'Skyjack 119646 cable, $273, no cost', [cable], 3300, null);
expectDecision('3', '137785 + 119646 in one cart', [led, cable], 3300, null);
expectDecision('4', 'Skyjack 147054, $4, cost_wholesale 1.89', [contact], 2000, null);
expectDecision('5', 'JLG 88671008 grease fitting, $1', [grease], 2000, null);
expectDecision('6', 'No-rule part, $900, no cost', [line({ name: 'Pump', category: 'Hydraulics', price: 900 })], 4300, null);
expectDecision('7', 'No-rule non-excluded part, $1,200', [line({ name: 'Pump', category: 'Hydraulics', price: 1200 })], 0, null);
expectDecision('8', 'No-rule battery charger, $800', [charger800], 4300, 'excluded_over_650');
expectDecision('9', 'No-rule part with weight_lbs 80', [heavy], 25000, 'ltl', 'Freight Shipping - LTL');

assert.equal(defaultFreightForItems([jcb]).unitAmountCents, 0);
assert.equal(hasExistingFreightRule(jcb), true);
assert.equal(defaultFreightForItems([glass]).unitAmountCents, 0);

const mixed = defaultFreightForItems([jcb, led]);
assert.equal(mixed.unitAmountCents, 2700);
assert.equal(mixed.freightFlag, null);

const quoteJcb = quoteCheckoutFreight([jcb]);
assert.equal(quoteJcb.totalCents, 2400);
assert.deepEqual(quoteJcb.lines.map((entry) => entry.name), ['Freight Shipping - JCB Parts']);

const quoteGlass = quoteCheckoutFreight([glass]);
assert.equal(quoteGlass.totalCents, 2500);
assert.equal(quoteGlass.lines[0]?.name, 'Freight Shipping - Cab Glass');

const quoteMixed = quoteCheckoutFreight([jcb, led]);
assert.equal(quoteMixed.totalCents, 2400 + 2700);
assert.deepEqual(
  quoteMixed.lines.map((entry) => `${entry.name} ${money(entry.cents)}`),
  ['Freight Shipping - JCB Parts $24.00', 'Freight Shipping $27.00'],
);

assert.equal(quoteCheckoutFreight([led]).totalCents, 2700);
assert.equal(quoteCheckoutFreight([led, cable]).totalCents, 3300);
assert.equal(quoteCheckoutFreight([jcb, led]).totalCents, quoteMixed.totalCents);

const simpleCharger = defaultFreightForSimpleItem({
  name: 'Genie 105739 Battery Charger (24V Signet HB600)',
  category: 'Chargers',
  price: 379,
  weight_lbs: 13,
  quantity: 1,
  metadata: { cost_wholesale: 270.3 },
});
assert.equal(simpleCharger.unitAmountCents, 3300);
assert.equal(simpleCharger.name, 'Freight Shipping');
assert.equal(simpleCharger.freightFlag, null);
assert.equal(
  defaultFreightForSimpleItem({ category: 'JCB General Parts', price: 86, quantity: 1 }).unitAmountCents,
  0,
);
assert.equal(
  defaultFreightForSimpleItem({ category: 'Seats', price: 400, quantity: 1 }).unitAmountCents,
  0,
);
assert.equal(defaultFreightForSimpleItem({ price: 58, quantity: 1 }).unitAmountCents, 0);

assert.equal(quoteCheckoutFreight([line({ category: 'Mirrors', price: 40 })]).totalCents, 1700);
assert.equal(quoteCheckoutFreight([line({ category: 'Brakes', price: 40 })]).totalCents, 3500);
assert.equal(quoteCheckoutFreight([line({ category: 'Seats', price: 200 })]).totalCents, 2500);
assert.equal(quoteCheckoutFreight([line({ category: 'Seat cushions', price: 40 })]).totalCents, 2900);
assert.equal(quoteCheckoutFreight([line({ category: 'Seat covers', price: 40 })]).totalCents, 2900);
assert.equal(quoteCheckoutFreight([line({ category: 'Hydraulic Cylinders', price: 80 })]).totalCents, 2900);
assert.equal(quoteCheckoutFreight([line({ category: 'Undercarriage', price: 80 })]).totalCents, 2900);
assert.equal(quoteCheckoutFreight([line({ category: 'Steering rod ends', price: 40 })]).totalCents, 2500);
assert.equal(
  quoteCheckoutFreight([
    line({ category: 'Seats', price: 900, metadata: { cost_wholesale: 700 } }),
  ]).totalCents,
  0,
);

const lumberFork = line({
  name: 'CLASS II FORK (1.5X8X48 FTP)',
  category: 'Lumber Forks',
  price: 1784,
});
const lumberFreight = defaultFreightForItems([lumberFork]);
assert.equal(lumberFreight.unitAmountCents, 25000);
assert.equal(lumberFreight.freightFlag, 'ltl');
assert.equal(lumberFreight.name, 'Freight Shipping - LTL');

const genieCylinder = line({
  name: 'Genie 53.0300.2201GT Cylinder',
  category: 'Aerial Equipment Parts',
  price: 1129,
  weight_lbs: 74.9572,
});
const cylinderFreight = defaultFreightForItems([genieCylinder]);
assert.equal(cylinderFreight.unitAmountCents, 25000);
assert.equal(cylinderFreight.freightFlag, 'ltl');

const chargerModule = line({
  name: 'Hawker Forklift Charger Module – 6LA20671',
  category: 'Charger Modules',
  price: 829,
  metadata: { cost_wholesale: 526 },
});
assert.equal(defaultFreightForItems([chargerModule]).unitAmountCents, 0);
assert.equal(defaultFreightForItems([chargerModule]).freightFlag, null);
assert.equal(isExcludedFreightType(chargerModule), false);
const moduleWithLed = defaultFreightForItems([chargerModule, led]);
assert.equal(moduleWithLed.unitAmountCents, 2700);
assert.equal(moduleWithLed.freightFlag, null);

assert.equal(isExcludedFreightType(line({ name: 'Engine Oil Filter', category: 'Filters', price: 29 })), false);
assert.equal(isExcludedFreightType(line({ name: 'Turbo Charger Kit', category: 'Forklift Parts', price: 3149 })), false);
assert.equal(
  defaultFreightForItems([line({ name: 'Turbo Charger Kit', category: 'Forklift Parts', price: 3149 })]).unitAmountCents,
  0,
);

const fromComp = defaultFreightForItems([
  line({
    name: 'No column weight',
    category: 'Hydraulics',
    price: 40,
    metadata: { competitor_prices: [{ weight_lb: '80' }] },
  }),
]);
assert.equal(fromComp.unitAmountCents, 25000);
assert.equal(fromComp.freightFlag, 'ltl');

const under300 = quoteCheckoutFreight(
  Array.from({ length: 4 }, () => line({ name: 'Bracket', category: 'Hydraulics', price: 10, weight_lbs: 70 })),
);
assert.equal(under300.totalCents, 2700);
const over300 = quoteCheckoutFreight(
  Array.from({ length: 5 }, () => line({ name: 'Bracket', category: 'Hydraulics', price: 10, weight_lbs: 70 })),
);
assert.equal(over300.totalCents, 25000);
assert.equal(over300.freightFlag, 'ltl');

assert.equal(
  defaultFreightForItems([line({ isTraining: true, price: 49 })]).unitAmountCents,
  0,
);

const route = readFileSync(new URL('../../app/api/checkout/route.ts', import.meta.url), 'utf8');
assert.match(route, /if \(priceDollars < 25\)\s+return 1700/);
assert.match(route, /if \(priceDollars < 150\)\s+return 2400/);
assert.match(route, /if \(priceDollars < 300\)\s+return 2900/);
assert.match(route, /return 3500;/);
assert.match(route, /unit_amount: 39500/);
assert.match(route, /unit_amount: 1700/);
assert.match(route, /unit_amount: 2500/);
assert.match(route, /defaultFreightForItems\(body\.items\)/);
assert.match(route, /defaultFreightForSimpleItem\(simpleItem\)/);

console.log('defaultFreight tests passed');
console.log('');
for (const entry of cases) {
  const flag = entry.flag ? ` freight_flag=${entry.flag}` : '';
  const label = entry.cents > 0 ? `${entry.name} ${money(entry.cents)}` : money(0);
  console.log(`${entry.id}. ${entry.detail} → ${label}${flag}`);
}
console.log(`10. JCB part at $86 alone → Freight Shipping - JCB Parts ${money(quoteJcb.totalCents)}`);
console.log(`10. Kubota RD158-46450 cab glass, $141, cost $96.20 → ${quoteGlass.lines[0]?.name} ${money(quoteGlass.totalCents)}`);
console.log(
  `10. JCB $86 + Skyjack 137785 → ${quoteMixed.lines.map((entry) => `${entry.name} ${money(entry.cents)}`).join(' + ')} = ${money(quoteMixed.totalCents)}`,
);
console.log(
  `11. BuyNowButton charger (Genie 105739GT, $379, cost $270.30) → ${simpleCharger.name} ${money(simpleCharger.unitAmountCents)}`,
);
console.log(
  `12. Cart preview case 1 ${money(quoteCheckoutFreight([led]).totalCents)} | case 3 ${money(quoteCheckoutFreight([led, cable]).totalCents)} | case 10 ${money(quoteMixed.totalCents)}`,
);
console.log(`Lumber fork FEE-LF-001 → ${lumberFreight.name} ${money(lumberFreight.unitAmountCents)}`);
console.log(`Genie 53.0300.2201GT → ${cylinderFreight.name} ${money(cylinderFreight.unitAmountCents)}`);
console.log(`Charger module alone → ${money(defaultFreightForItems([chargerModule]).unitAmountCents)}`);
