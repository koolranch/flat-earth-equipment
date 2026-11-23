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

const lithiumWaived: CheckoutFreightItem = {
  priceId: 'price_lithium',
  category: 'Lithium Batteries',
  metadata: { free_freight: true, weight_lbs: 10 },
};
applyCatalogFreightFacts(
  lithiumWaived,
  freightFactsFromRow({
    category: 'Lithium Batteries',
    category_slug: 'lithium-batteries',
    price: 2149,
    weight_lbs: 102,
    metadata: { free_freight: true },
  }),
);
assert.equal(lithiumWaived.metadata?.free_freight, undefined);
assert.equal(lithiumWaived.metadata?.weight_lbs, 102);

const waived: CheckoutFreightItem = {
  priceId: 'price_glass',
  metadata: { free_freight: true },
};
applyCatalogFreightFacts(waived, glass);
assert.equal(waived.category, 'Cab Glass');
assert.equal(waived.metadata?.category_slug, 'cab-glass');
assert.equal(waived.metadata?.free_freight, undefined);

const capped = freightFactsFromRow({
  category: 'JCB General Parts',
  category_slug: 'jcb-general-parts',
  price: 919,
  metadata: { free_freight: true, qty_max: 1, cost_wholesale: 703.3 },
});
const raised: CheckoutFreightItem = {
  priceId: 'price_handle',
  metadata: { qty_max: 9 },
};
applyCatalogFreightFacts(raised, capped);
assert.equal(raised.metadata?.qty_max, 1);

const invented: CheckoutFreightItem = {
  priceId: 'price_other',
  metadata: { qty_max: 1 },
};
applyCatalogFreightFacts(invented, glass);
assert.equal(invented.metadata?.qty_max, undefined);

const weighed = freightFactsFromRow({
  name: 'Skyjack 137785 Red LED block',
  category: 'Switches & Sensors',
  category_slug: 'switches-sensors',
  price: 58,
  weight_lbs: null,
  metadata: { competitor_prices: [{ weight_lb: 12 }, { weight_lb: null }] },
});
assert.equal(weighed.name, 'Skyjack 137785 Red LED block');
assert.equal(weighed.weightLbs, 12);

const copied: CheckoutFreightItem = { priceId: 'price_led' };
applyCatalogFreightFacts(copied, weighed);
assert.equal(copied.name, 'Skyjack 137785 Red LED block');
assert.equal(copied.category, 'Switches & Sensors');
assert.equal(copied.price, 58);
assert.equal(copied.metadata?.weight_lbs, 12);

const keptWeight: CheckoutFreightItem = {
  priceId: 'price_led',
  metadata: { weight_lbs: 4 },
};
applyCatalogFreightFacts(keptWeight, weighed);
assert.equal(keptWeight.metadata?.weight_lbs, 4);

console.log('checkoutFreight tests passed');
