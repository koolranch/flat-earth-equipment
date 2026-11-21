import assert from 'node:assert/strict';
import {
  isPartsCartLine,
  partsEventPayload,
  partsFunnelItem,
  quoteLeadAlreadyTracked,
  quoteLeadParams,
} from './partsFunnel';

const part = partsFunnelItem({
  itemId: '7316759',
  itemName: 'Bobcat rubber track',
  price: 949.005,
  quantity: 2,
});

assert.equal(part.item_category, 'parts');
assert.equal(part.item_id, '7316759');
assert.equal(part.price, 949.01);
assert.equal(part.quantity, 2);
assert.deepEqual(Object.keys(part).sort(), [
  'item_category',
  'item_id',
  'item_name',
  'price',
  'quantity',
]);

const payload = partsEventPayload([part]);
assert.equal(payload.currency, 'USD');
assert.equal(payload.value, 1898.02);

const lead = quoteLeadParams('quote_page', '/quote');
assert.deepEqual(lead, {
  form_id: 'quote_page',
  page_path: '/quote',
  value: 0,
  currency: 'USD',
});
assert.equal('email' in lead, false);

assert.equal(
  isPartsCartLine({ category: 'Rubber Tracks', stripe_price_id: 'price_parts' }),
  true
);
assert.equal(isPartsCartLine({ category: 'Charger Modules' }), false);
assert.equal(isPartsCartLine({ metadata: { moduleId: '6LA20671' } }), false);
assert.equal(
  isPartsCartLine({ stripe_price_id: 'price_1USyGDHJI548rO8J23ZhwOml' }),
  false
);

assert.equal(quoteLeadAlreadyTracked({ slug: 'charger-modules-fleet' }), true);
assert.equal(quoteLeadAlreadyTracked({ slug: 'enersys-6la20671' }), false);
assert.equal(quoteLeadAlreadyTracked({ sku: 'FLEET-CHARGERS' }), true);
