import assert from "node:assert/strict";
import {
  chargerCanonicalPath,
  chargerSellPrice,
  chargerShouldNoIndex,
  isGreenVoltageAmpSlug,
  overlayCatalogWithParts,
} from "./chargers";

const emptyCatalog = {
  name: "GREEN2 36V 45A",
  sku: "GREEN2-36V-45A",
  images: null as string[] | null,
  fsip_price: null as number | null,
  your_price: null as number | null,
  stripe_price_id: null as string | null,
  meta_description: null as string | null,
};

const part = {
  name: "GREEN2 36V 45A",
  sku: "GREEN2-36V-45A",
  description: "GREEN2 36V 45A industrial battery charger.",
  image_url: "https://example.com/green2.jpeg",
  price: "1100.00",
  price_cents: 110000,
  stripe_price_id: "price_test",
};

const completeCatalog = {
  ...emptyCatalog,
  images: ["https://example.com/catalog.jpg"],
  your_price: 1642,
  stripe_price_id: "price_catalog",
  meta_description: "Catalog copy",
};

const hydrated = overlayCatalogWithParts(emptyCatalog, part);
assert.deepEqual(hydrated.images, ["https://example.com/green2.jpeg"]);
assert.equal(hydrated.your_price, 1100);
assert.equal(hydrated.stripe_price_id, "price_test");
assert.equal(hydrated.meta_description, part.description);
assert.equal(chargerSellPrice(hydrated), 1100);
assert.equal(isGreenVoltageAmpSlug("green2-36v-45a"), true);
assert.equal(isGreenVoltageAmpSlug("green2-single-phase-battery-charger"), false);
assert.equal(chargerShouldNoIndex("green2-36v-45a", hydrated), true);
assert.equal(chargerShouldNoIndex("green2-36v-45a", emptyCatalog), true);
assert.equal(
  chargerCanonicalPath("green2-36v-45a"),
  "/chargers/green2-single-phase-battery-charger"
);
assert.equal(
  chargerCanonicalPath("green2-single-phase-battery-charger"),
  "/chargers/green2-single-phase-battery-charger"
);
assert.equal(
  chargerShouldNoIndex("green2-single-phase-battery-charger", completeCatalog),
  false
);
assert.equal(
  chargerShouldNoIndex("delta-q-quiq-48v-18a-charger-9124800", emptyCatalog),
  true
);
const preserved = overlayCatalogWithParts(completeCatalog, part);
assert.deepEqual(preserved.images, ["https://example.com/catalog.jpg"]);
assert.equal(preserved.your_price, 1642);
assert.equal(preserved.stripe_price_id, "price_catalog");
assert.equal(preserved.meta_description, "Catalog copy");

console.log("chargers.test.ts: all assertions passed");
