import assert from 'node:assert/strict';
import {
  applyCatalogFreightFacts,
  freightFactsFromRow,
  type CheckoutFreightItem,
} from './checkoutFreight';

const glass = freightFactsFromRow({
  category: 'Cab Glass',
  category_slug: 'cab-glass',
  price: '79.00',
  metadata: { cost_wholesale: 61.75 },
});

const bare: { priceId: string; metadata?: Record<string, unknown>; category?: string; price?: number } = {
  priceId: 'price_glass',
};
applyCatalogFreightFacts(bare, glass);
assert.equal(bare.category, 'Cab Glass');
assert.equal(bare.price, 79);
assert.equal(bare.metadata?.category_slug, 'cab-glass');
assert.equal(bare.metadata?.cost_wholesale, 61.75);
assert.equal(bare.metadata?.free_freight, undefined);

const explicit: CheckoutFreightItem = {
  priceId: 'price_glass',
  category: 'Cab Glass',
  price: 79,
  metadata: { category_slug: 'cab-glass', freight_cents: 2500 },
};
applyCatalogFreightFacts(explicit, {
  ...glass,
  freightCents: 1800,
  freeFreight: true,
});
assert.ok(explicit.metadata);
assert.equal(explicit.metadata.freight_cents, 2500);
assert.equal(explicit.metadata.free_freight, true);

const track: CheckoutFreightItem = { priceId: 'price_track' };
applyCatalogFreightFacts(
  track,
  freightFactsFromRow({
    category: 'Rubber Tracks',
    category_slug: 'rubber-tracks',
    price: 949,
    metadata: { free_freight: true, cost_wholesale: 800 },
  }),
);
assert.equal(track.metadata?.free_freight, true);

const waived: CheckoutFreightItem = {
  priceId: 'price_glass',
  metadata: { free_freight: true },
};
applyCatalogFreightFacts(waived, glass);
assert.equal(waived.category, 'Cab Glass');
assert.equal(waived.metadata?.category_slug, 'cab-glass');
assert.equal(waived.metadata?.free_freight, undefined);

console.log('checkoutFreight tests passed');
