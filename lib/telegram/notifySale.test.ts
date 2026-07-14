import assert from 'node:assert/strict';
import {
  formatPartsSaleMessage,
  formatTrainingSaleMessage,
  isTelegramConfigured,
  notifyCheckoutSale,
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

process.env.TELEGRAM_BOT_TOKEN = prevToken;
process.env.TELEGRAM_CHAT_ID = prevChat;

console.log('notifySale.test.ts: all assertions passed');
