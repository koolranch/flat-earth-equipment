import assert from 'node:assert/strict';
import {
  buildMagItemUrl,
  canonicalBrand,
  isMappableOem,
  magPartId,
  normalizeMagPartNumber,
  oePrefixForBrand,
  partIdentityKey,
  stripOePrefix,
} from './tvhOePrefixes';

// JCB keeps its slash — the stripped form serves a "no longer valid" page at HTTP 200.
assert.equal(
  buildMagItemUrl('JCB', '333/D1629'),
  'https://www.magnasourceinc.com/itemdetail/JC333/D1629'
);

// Toyota keeps its dashes.
assert.equal(
  buildMagItemUrl('Toyota', '16420-U1280-71'),
  'https://www.magnasourceinc.com/itemdetail/TY16420-U1280-71'
);

assert.equal(magPartId('Skyjack', '107269'), 'SJ107269');
assert.equal(magPartId('Hyster', '1387270'), 'HY1387270');
assert.equal(magPartId('Bobcat', '6903118'), 'BC6903118');

// Brand spelling variants in the catalog resolve to one prefix.
assert.equal(canonicalBrand('Power Boss'), 'Powerboss');
assert.equal(canonicalBrand('PowerBoss'), 'Powerboss');
assert.equal(canonicalBrand('Sky Trak'), 'Skytrack');
assert.equal(oePrefixForBrand('Sky Trak')?.prefix, 'SA');
assert.equal(canonicalBrand('Lithium Rhino'), null);
assert.equal(magPartId('Lithium Rhino', '51V65AH'), null);

// An already-prefixed number must not be doubled.
assert.equal(magPartId('Hyster', 'HY1387270'), 'HY1387270');
assert.equal(stripOePrefix('HY1387270', 'Hyster'), '1387270');
// A part number that merely starts with prefix letters is left intact.
assert.equal(stripOePrefix('KHN31680', 'Case'), 'KHN31680');

assert.equal(normalizeMagPartNumber(' 333/d1629 '), '333/D1629');
assert.equal(normalizeMagPartNumber('79-303 -15'), '79-303-15');

// Junk OEM values are skipped rather than turned into bad URLs.
assert.equal(isMappableOem('333/'), false);
assert.equal(isMappableOem('12'), false);
assert.equal(isMappableOem(''), false);
assert.equal(isMappableOem(null), false);
assert.equal(isMappableOem('8-142'), true);
assert.equal(buildMagItemUrl('Lancer Boss', '333/'), null);

// Dedup collapses brand-spelling duplicates onto one identity.
assert.equal(partIdentityKey('Power Boss', '3305663PH'), partIdentityKey('Powerboss', '3305663PH'));
assert.equal(partIdentityKey('JCB', '333/D1629'), 'JCB|333/D1629');

console.log('tvhOePrefixes.test.ts: all assertions passed');
