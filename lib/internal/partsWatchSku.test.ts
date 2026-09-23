import assert from 'node:assert/strict';
import { isCatalogSku } from './partsWatchSku';

assert.equal(isCatalogSku('333D1629'), true);
assert.equal(isCatalogSku('RT-T190-400X86X49-C'), true);
assert.equal(isCatalogSku('701/80145'), true);
assert.equal(isCatalogSku('RA 590-726'), true);
assert.equal(isCatalogSku('RA 590-701'), true);
assert.equal(isCatalogSku('  CR 120091  '), true);
assert.equal(isCatalogSku('RA  590-726'), false);
assert.equal(isCatalogSku(''), false);
assert.equal(isCatalogSku('../etc'), false);
assert.equal(isCatalogSku('sku with\nnewline'), false);

console.log('partsWatchSku.test.ts: ok');
