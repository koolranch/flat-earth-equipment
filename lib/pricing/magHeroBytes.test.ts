import assert from 'node:assert/strict';
import { bytesFromRawBase64, fetchMagHeroBytes, isMagGetImageUrl } from './magHeroBytes';

const GOOD =
  'https://www.magnasourceinc.com/services/getimage/lower-door-jc333d2714.jpg?key=abc';

assert.equal(isMagGetImageUrl(GOOD), true);
assert.equal(isMagGetImageUrl('https://magnasourceinc.com/services/getimage/seal.jpg'), true);
assert.equal(isMagGetImageUrl('http://www.magnasourceinc.com/services/getimage/seal.jpg'), false);
assert.equal(isMagGetImageUrl('https://www.magnasourceinc.com/itemdetail/JC333/D2714'), false);
assert.equal(isMagGetImageUrl('https://cdn.example.com/services/getimage/seal.jpg'), false);
assert.equal(isMagGetImageUrl('not a url'), false);

const jpeg = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff]),
  Buffer.alloc(29, 0),
  Buffer.from([0xff, 0xd9]),
]);
const decoded = bytesFromRawBase64({ data: { rawBase64: jpeg.toString('base64') } });
assert.ok(decoded);
assert.equal(decoded!.length, jpeg.length);
assert.equal(decoded![0], 0xff);
assert.equal(decoded![decoded!.length - 1], 0xd9);
assert.equal(bytesFromRawBase64({ data: { markdown: 'not an image' } }), null);

const originalFetch = globalThis.fetch;
let requested = '';
globalThis.fetch = (async (url: string | URL) => {
  requested = String(url);
  return new Response(JSON.stringify({ data: { rawBase64: jpeg.toString('base64') } }), { status: 200 });
}) as typeof fetch;

const got = await fetchMagHeroBytes(GOOD, 'test-key');
assert.equal(requested, 'https://api.firecrawl.dev/v2/scrape');
assert.equal(got.mime, 'image/jpeg');
assert.equal(got.bytes.length, jpeg.length);

await assert.rejects(
  () => fetchMagHeroBytes('https://example.com/photo.jpg', 'test-key'),
  /not a Magnasource/
);

globalThis.fetch = originalFetch;

console.log('magHeroBytes.test.ts ok');
