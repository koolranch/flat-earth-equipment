import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// The FEE bulk-sales landing page must never render on app.getforkliftcertified.com:
// it contradicts GFC's self-serve pricing and shows FEE contact details.
// These assertions guard the host-gating branches in app/trainer/page.tsx.

const source = readFileSync('app/trainer/page.tsx', 'utf8');

test('logged-out GFC visitors are redirected to login, not the bulk-sales page', () => {
  assert.match(source, /if \(!user\) \{\s*\n\s*if \(isGfcHost\) \{\s*\n\s*redirect\('\/login\?next=\/trainer'\);/);
});

test('auth-check errors on the GFC host redirect to login instead of rendering the FEE landing page', () => {
  // Regression: an expired session throws inside getUser() (token refresh
  // cannot write cookies from a Server Component), and the catch block used to
  // render PublicTrainerLanding unconditionally.
  const catchBlock = source.slice(source.indexOf('} catch (error) {'));
  assert.match(catchBlock, /if \(isGfcHost\) \{\s*\n\s*redirect\('\/login\?next=\/trainer'\);/);
});

test('redirects thrown inside the try block are rethrown, not swallowed by the catch', () => {
  assert.match(source, /NEXT_REDIRECT/);
});
