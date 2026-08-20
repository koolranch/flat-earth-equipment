import assert from "node:assert/strict";
import { getChargerDetailHref } from "./batteryChargers";

assert.equal(
  getChargerDetailHref("delta-q-quiq-48v-18a-charger-9124800"),
  "/parts/delta-q-quiq-48v-18a-charger-9124800"
);
assert.equal(
  getChargerDetailHref("green4-48v-forklift-charger"),
  "/chargers/green4-48v-forklift-charger"
);

console.log("batteryChargers.test.ts: all assertions passed");
