import assert from 'node:assert/strict';
import {
  CHECKOUT_SESSION_NOTIFY_EXPAND,
  formatPartsSaleMessage,
  formatTrainingSaleMessage,
  isTelegramConfigured,
  notifyCheckoutSale,
  shippingAddressFromSession,
  type PartsSaleDetails,
  type TrainingSaleDetails,
} from './notifySale';

// --- formatters ---

const parts: PartsSaleDetails = {
  sessionId: 'cs_test_abc',
  totalCents: 24900,
  lineItems: [
    { sku: '332X6237', name: 'Joystick', quantity: 1 },
    { sku: '', name: 'Shipping', quantity: 1, isShipping: true },
  ],
  shippingCity: 'Denver',
  shippingState: 'CO',
};

const partsMsg = formatPartsSaleMessage(parts);
assert.match(partsMsg, /Parts sale/);
assert.match(partsMsg, /332X6237/);
assert.doesNotMatch(partsMsg, /Shipping/);
assert.match(partsMsg, /\$249\.00/);
assert.match(partsMsg, /Denver, CO/);
assert.match(partsMsg, /cs_test_abc/);

const partsNoSku: PartsSaleDetails = {
  sessionId: 'cs_test_def',
  totalCents: 1000,
  lineItems: [{ sku: '', name: 'Mystery Part', quantity: 2 }],
  shippingCity: 'Austin',
  shippingState: '',
};
const partsNoSkuMsg = formatPartsSaleMessage(partsNoSku);
assert.match(partsNoSkuMsg, /Mystery Part/);
assert.match(partsNoSkuMsg, /qty 2/);
assert.match(partsNoSkuMsg, /Austin/);
assert.doesNotMatch(partsNoSkuMsg, /Austin,/);

const training: TrainingSaleDetails = {
  sessionId: 'cs_test_train',
  totalCents: 4900,
  planLabel: 'Forklift certification ×1',
  customerEmail: 'buyer@example.com',
};
const trainingMsg = formatTrainingSaleMessage(training);
assert.match(trainingMsg, /Training sale/);
assert.match(trainingMsg, /Forklift certification/);
assert.match(trainingMsg, /\$49\.00/);
assert.match(trainingMsg, /buyer@example\.com/);

// --- config gate ---

const prevToken = process.env.TELEGRAM_BOT_TOKEN;
const prevChat = process.env.TELEGRAM_CHAT_ID;
delete process.env.TELEGRAM_BOT_TOKEN;
delete process.env.TELEGRAM_CHAT_ID;
assert.equal(isTelegramConfigured(), false);

// Missing env must no-op and never throw
await notifyCheckoutSale({
  kind: 'training',
  sessionId: 'cs_test_noop',
  totalCents: 4900,
  planLabel: 'Forklift certification',
  customerEmail: 'x@y.com',
});

process.env.TELEGRAM_BOT_TOKEN = '   ';
process.env.TELEGRAM_CHAT_ID = '123';
assert.equal(isTelegramConfigured(), false, 'whitespace-only token must count as unset');

process.env.TELEGRAM_BOT_TOKEN = prevToken;
process.env.TELEGRAM_CHAT_ID = prevChat;

// Stripe basil+ rejects expand: ['shipping_details'] — retrieve must only expand line items.
assert.deepEqual(CHECKOUT_SESSION_NOTIFY_EXPAND, [
  'line_items',
  'line_items.data.price.product',
]);
assert.ok(
  !CHECKOUT_SESSION_NOTIFY_EXPAND.includes('shipping_details' as (typeof CHECKOUT_SESSION_NOTIFY_EXPAND)[number]),
  'shipping_details is not expandable on Checkout Sessions'
);

const collectedOnly = shippingAddressFromSession({
  collected_information: {
    shipping_details: { address: { city: 'Houston', state: 'TX' } },
  },
});
assert.deepEqual(collectedOnly, { city: 'Houston', state: 'TX' });

const collectedWins = shippingAddressFromSession({
  collected_information: {
    shipping_details: { address: { city: 'Houston', state: 'TX' } },
  },
  shipping_details: { address: { city: 'Legacy', state: 'XX' } },
  customer_details: { address: { city: 'Billing', state: 'YY' } },
});
assert.deepEqual(collectedWins, { city: 'Houston', state: 'TX' });

const customerFallback = shippingAddressFromSession({
  customer_details: { address: { city: 'Olympia', state: 'WA' } },
});
assert.deepEqual(customerFallback, { city: 'Olympia', state: 'WA' });

console.log('notifySale.test.ts: all assertions passed');
