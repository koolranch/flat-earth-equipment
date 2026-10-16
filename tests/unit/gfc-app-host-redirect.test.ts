import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// app.getforkliftcertified.com serves only the trainer/claim surface. Anything
// else (e.g. the parts-store /shipping-returns page Google once indexed there)
// must permanently redirect to the primary FEE domain so it drops out of the
// index, and the root/dashboard shortcut must stay a temporary redirect.

const source = readFileSync('middleware.ts', 'utf8');

test('non-manager paths on the app host redirect permanently to www.flatearthequipment.com', () => {
  assert.match(
    source,
    /destination\.host = 'www\.flatearthequipment\.com';\s*\n\s*destination\.port = '';[\s\S]*?NextResponse\.redirect\(destination, 308\)/,
  );
});

test('the app host root still redirects temporarily to /trainer', () => {
  assert.match(source, /new URL\('\/trainer', request\.url\), 307/);
});

test('the app host keeps its noindex header', () => {
  assert.match(source, /isManagerAppHost\)\s*\{[\s\S]*?X-Robots-Tag', 'noindex, nofollow'/);
});
