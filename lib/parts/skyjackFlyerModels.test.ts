import assert from 'node:assert/strict';
import {
  mergeAdditiveFitment,
  normalizeFlyerModelToken,
  normalizeFlyerModelsCell,
} from './skyjackFlyerModels';

assert.deepEqual(
  normalizeFlyerModelToken('SJ/SJIII 3219').map((r) => r.canonical),
  ['SJ 3219', 'SJIII 3219'],
);

const rt = normalizeFlyerModelToken('SJ6832 RT');
assert.deepEqual(rt, [{ canonical: 'SJRT 6832', flags: ['rt_vs_compact'] }]);
const compact6832 = normalizeFlyerModelToken('SJ/SJIII 6832').map((r) => r.canonical);
assert.deepEqual(compact6832, ['SJ 6832', 'SJIII 6832']);
assert.equal(compact6832.includes('SJRT 6832'), false);

assert.deepEqual(normalizeFlyerModelToken('SJII 3215'), [
  { canonical: 'SJII 3215', flags: [] },
]);

const garbled = normalizeFlyerModelToken('SJ/SJIIISJIII 3226');
assert.deepEqual(
  garbled.map((r) => r.canonical),
  ['SJ 3226', 'SJIII 3226'],
);
assert.equal(
  garbled.every((r) => r.flags.includes('garbled_sjiii')),
  true,
);

const bare = normalizeFlyerModelToken('3220');
assert.deepEqual(
  bare.map((r) => r.canonical),
  ['SJ 3220', 'SJIII 3220'],
);
assert.equal(
  bare.every((r) => r.flags.includes('missing_prefix')),
  true,
);

const pump = normalizeFlyerModelsCell(
  'SJ/SJIII 3220, SJ/SJIII 3226, SJ/SJIII 4632, SJ/SJIII 6826, SJ/SJIII 6832, SJ6832 RT',
).map((r) => r.canonical);
assert.equal(pump.includes('SJ 6826'), true);
assert.equal(pump.includes('SJIII 6826'), true);
assert.equal(pump.includes('SJRT 6832'), true);
assert.equal(pump.includes('SJRT 6826'), false);

assert.deepEqual(
  mergeAdditiveFitment(
    ['SJRT 6826', 'SJRT 6832', 'SJRT 8841', 'SJRT 9241'],
    ['SJ 3219', 'SJIII 3219', 'SJRT 6832'],
  ),
  ['SJRT 6826', 'SJRT 6832', 'SJRT 8841', 'SJRT 9241', 'SJ 3219', 'SJIII 3219'],
);

console.log('skyjackFlyerModels.test.ts passed');
