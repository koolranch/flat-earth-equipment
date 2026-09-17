import assert from 'node:assert/strict';
import { isActionableReading, isSoldOutReading, parseMagSnapshot, stickerDrift } from './magSnapshot';

/** Trimmed capture of https://www.magnasourceinc.com/itemdetail/JC333/D1629 (2026-09-16). */
const JCB_IN_STOCK = `
> Item Detail

# ELECTRONIC SENSOR

## 333/D1629 for Jcb

### Part Number: JC333/D1629

21 on hand and ready to ship today

Inventory availability confirmed by supplier at 9/16/2026 9:02:21 PM

$340

.83

$675.02

Save $334.19 (50%)

TOTAL PRICE

$340.83

Add To Cart

Selling Unit:

EA

Weight:

0.1477 lbs.

In Stock.

Related Items...

GEHL GB106100 ELECTRONIC SENSOR
`;

/** Trimmed capture of /itemdetail/SJ107269 — limited, 1 on hand. */
const SKYJACK_LIMITED = `
# VALVE - SOLENOID LOWERING

## 107269 for Skyjack

### Part Number: SJ107269

Limited Availability. 1 on hand and ready to ship today

Inventory availability confirmed by supplier at 9/16/2026 9:21:57 PM

$97

.27

TOTAL PRICE

$97.27

Selling Unit:

EA

Weight:

0.23 lbs.

**In Stock**.
`;

/** Trimmed capture of /itemdetail/TY16420-U1280-71 — capped count. */
const TOYOTA_FLOOR = `
# RADIATOR - ALUMINUM

## 16420-U1280-71 for Toyota

### Part Number: TY16420-U1280-71

100+ in stock and ready to ship today

Inventory availability confirmed by supplier at 9/16/2026 9:35:18 PM

$564

.61

$928.82

Save $364.21 (39%)

TOTAL PRICE

$564.61

Weight:

17.85 lbs.
`;

/** Trimmed capture of /itemdetail/JC333D1629 — separators stripped, HTTP 200. */
const INVALID = `
> Item Detail

### Part Number: jc333d1629

Sorry, the requested item is no longer valid. Please try your search again or contact our customer support team for assistance.
`;

const jcb = parseMagSnapshot(JCB_IN_STOCK, { magPartId: 'JC333/D1629', brand: 'JCB' });
assert.equal(jcb.identityOk, true);
assert.equal(jcb.availability, 'in_stock');
assert.equal(jcb.price, 340.83);
assert.equal(jcb.listPrice, 675.02);
assert.equal(jcb.qtyOnHand, 21);
assert.equal(jcb.qtyIsFloor, false);
assert.equal(jcb.weightLb, 0.1477);
assert.equal(jcb.sellingUnit, 'EA');
assert.equal(jcb.supplierConfirmedAt, '9/16/2026 9:02:21 PM');
assert.equal(jcb.pageTitle, 'ELECTRONIC SENSOR');
assert.equal(isSoldOutReading(jcb.availability), false);

const skyjack = parseMagSnapshot(SKYJACK_LIMITED, { magPartId: 'SJ107269', brand: 'Skyjack' });
assert.equal(skyjack.availability, 'limited');
assert.equal(skyjack.price, 97.27);
assert.equal(skyjack.listPrice, null);
assert.equal(skyjack.qtyOnHand, 1);
// Limited is a review flag, never an auto-pull: Mag read 1 on JCB 333/H8243 while the
// vendor held 24.
assert.equal(isSoldOutReading(skyjack.availability), false);

const toyota = parseMagSnapshot(TOYOTA_FLOOR, {
  magPartId: 'TY16420-U1280-71',
  brand: 'Toyota',
});
assert.equal(toyota.availability, 'in_stock');
assert.equal(toyota.qtyOnHand, 100);
assert.equal(toyota.qtyIsFloor, true);
assert.equal(toyota.price, 564.61);
assert.equal(toyota.listPrice, 928.82);

const invalid = parseMagSnapshot(INVALID, { magPartId: 'JC333D1629', brand: 'JCB' });
assert.equal(invalid.availability, 'invalid_pn');
assert.equal(isActionableReading(invalid.availability), false);

// Identity gates: a page for a different part yields nothing actionable.
const wrongPart = parseMagSnapshot(JCB_IN_STOCK, { magPartId: 'JC333/D9999', brand: 'JCB' });
assert.equal(wrongPart.identityOk, false);
assert.equal(wrongPart.availability, 'unknown');
assert.equal(isActionableReading(wrongPart.availability), false);

const wrongBrand = parseMagSnapshot(JCB_IN_STOCK, { magPartId: 'JC333/D1629', brand: 'Genie' });
assert.equal(wrongBrand.identityOk, false);
assert.equal(wrongBrand.availability, 'unknown');

// Empty / garbage responses fail safe.
assert.equal(parseMagSnapshot('', { magPartId: 'JC333/D1629', brand: 'JCB' }).availability, 'unknown');

/** Trimmed capture of /itemdetail/JC320/04133 — backordered with an arrival window. */
const JCB_BACKORDER = `
# FILTER - OIL

## 320/04133 for Jcb

### Part Number: JC320/04133

$41

.98

TOTAL PRICE

$41.98

Selling Unit:

EA

Weight:

1.40 lbs.

**1** Backordered items. Estimated to arrive between **Friday, October 9** and **Friday, October 23** on average.

Related Items...

NISSAN NIOILFILTER FILTER
`;

const backordered = parseMagSnapshot(JCB_BACKORDER, {
  magPartId: 'JC320/04133',
  brand: 'JCB',
});
assert.equal(backordered.availability, 'backorder');
assert.equal(isSoldOutReading(backordered.availability), true);
// The "1" belongs to the backorder quantity, not on-hand stock.
assert.equal(backordered.qtyOnHand, null);
assert.equal(backordered.price, 41.98);
assert.equal(backordered.backorderEta, 'Friday, October 9 – Friday, October 23');

/** Trimmed capture of /itemdetail/JL4360357 — backordered, special order, no ETA. */
const JLG_SPECIAL_ORDER = `
# SWITCH PRESSURE 15PSI (FORD)

## 4360357 for Jlg

### Part Number: JL4360357

$97

.01

$111.56

Save $14.55 (13%)

TOTAL PRICE

$97.01

Weight:

0.17 lbs.

**1** Backordered items. Estimated delivery not available.

This item is special ordered directly from our suppliers. Special orders can not be cancelled after it has been ordered.

Due to the nature or usage of this item, this item is not returnable after it has been ordered.
`;

const jlgSpecial = parseMagSnapshot(JLG_SPECIAL_ORDER, {
  magPartId: 'JL4360357',
  brand: 'JLG',
});
assert.equal(jlgSpecial.availability, 'special_order');
assert.equal(isSoldOutReading(jlgSpecial.availability), true);
assert.equal(jlgSpecial.qtyOnHand, null);
assert.equal(jlgSpecial.backorderEta, 'not available');
assert.equal(jlgSpecial.listPrice, 111.56);

// Zero on hand is the one affirmative sold-out reading.
const zero = parseMagSnapshot(
  `# PUMP\n\n## 333/X1234 for Jcb\n\n### Part Number: JC333/X1234\n\n0 on hand\n\nTOTAL PRICE\n\n$120.00\n`,
  { magPartId: 'JC333/X1234', brand: 'JCB' }
);
assert.equal(zero.availability, 'backorder');
assert.equal(isSoldOutReading(zero.availability), true);

const specialOrder = parseMagSnapshot(
  `# PUMP\n\n## 333/X1234 for Jcb\n\n### Part Number: JC333/X1234\n\n0 on hand\n\nSupplier special order — non-cancellable.\n\nTOTAL PRICE\n\n$120.00\n`,
  { magPartId: 'JC333/X1234', brand: 'JCB' }
);
assert.equal(specialOrder.availability, 'special_order');
assert.equal(isSoldOutReading(specialOrder.availability), true);

// Return/cancellation boilerplate must not override a real on-hand count.
const policyNoise = parseMagSnapshot(
  `# PUMP\n\n## 333/X1234 for Jcb\n\n### Part Number: JC333/X1234\n\n40 on hand and ready to ship today\n\nSpecial order items are non-returnable.\n\nTOTAL PRICE\n\n$120.00\n`,
  { magPartId: 'JC333/X1234', brand: 'JCB' }
);
assert.equal(policyNoise.availability, 'in_stock');
assert.equal(isSoldOutReading(policyNoise.availability), false);

// Sticker drift math.
const onTarget = stickerDrift({ ourSell: 323, magPrice: 340.83, targetDiscount: 0.05 });
assert.equal(onTarget.aboveMag, false);
assert.ok(Math.abs(onTarget.driftPoints) < 0.6, `expected near target, got ${onTarget.driftPoints}`);

const above = stickerDrift({ ourSell: 400, magPrice: 340.83, targetDiscount: 0.05 });
assert.equal(above.aboveMag, true);
assert.ok(above.driftPoints < 0);

console.log('magSnapshot.test.ts: all assertions passed');
