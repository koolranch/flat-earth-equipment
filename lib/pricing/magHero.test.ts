import assert from 'node:assert/strict';
import {
  currentHeroKind,
  heroCandidateFromOgImage,
  heroFilename,
  isSeatCategory,
  isSeatFamily,
  toStoredHeroReading,
} from './magHero';

// og:image shape as seen on the JCB 333/D1629 page (2026-09-17), signature redacted. The
// key is a per-render signature and must never be stored — only the filename survives.
const JCB_OG =
  'https://www.magnasourceinc.com/services/getimage/electronic-sensor-jc333d1629.jpg?key=REDACTED-per-render-signature';

assert.equal(heroFilename(JCB_OG), 'electronic-sensor-jc333d1629.jpg');
assert.equal(heroFilename('https://x/y/z.png#frag'), 'z.png');
assert.equal(heroFilename(''), null);
assert.equal(heroFilename('https://x/y/'), null);

// The JCB slash in the part id is stripped in the filename; identity still matches.
{
  const hero = heroCandidateFromOgImage(JCB_OG, 'JC333/D1629');
  assert.ok(hero);
  assert.equal(hero.filename, 'electronic-sensor-jc333d1629.jpg');
  assert.equal(hero.identityOk, true);
  assert.equal(hero.placeholderSuspect, false);
  assert.ok(!JSON.stringify(hero).includes('key='), 'signed key must not leak into the candidate');
}

// The related-items carousel image is a different part — the gate must reject it. This is
// exactly what an LLM extractor picked as the "hero" on the same page.
{
  const carousel =
    'https://www.magnasourceinc.com/services/getimage/electronic-sensor-gb106100.jpg?key=abc';
  const hero = heroCandidateFromOgImage(carousel, 'JC333/D1629');
  assert.ok(hero);
  assert.equal(hero.identityOk, false);
}

// Toyota dashes and Skyjack plain ids.
assert.equal(
  heroCandidateFromOgImage('https://m/services/getimage/seat-ty53720u223171.jpg?key=k', 'TY53720-U2231-71')!
    .identityOk,
  true
);
assert.equal(
  heroCandidateFromOgImage('https://m/services/getimage/relay-sj161870.jpg', 'SJ161870')!.identityOk,
  true
);

// Placeholder graphics are flagged, and never count as identity matches by accident.
{
  const hero = heroCandidateFromOgImage('https://m/services/getimage/no-image-available.jpg', 'JC333/D1629');
  assert.ok(hero);
  assert.equal(hero.placeholderSuspect, true);
  assert.equal(hero.identityOk, false);
}

// Missing og:image → no candidate.
assert.equal(heroCandidateFromOgImage(null, 'JC333/D1629'), null);
assert.equal(heroCandidateFromOgImage(undefined, 'JC333/D1629'), null);
assert.equal(heroCandidateFromOgImage('', 'JC333/D1629'), null);

// Very short ids cannot pass the substring gate — avoids false positives on e.g. "12".
assert.equal(heroCandidateFromOgImage('https://m/x/part-12.jpg', '12')!.identityOk, false);

// Stored shape.
{
  const stored = toStoredHeroReading(heroCandidateFromOgImage(JCB_OG, 'JC333/D1629'), '2026-09-17T10:30:00.000Z');
  assert.deepEqual(stored, {
    checked_at: '2026-09-17T10:30:00.000Z',
    filename: 'electronic-sensor-jc333d1629.jpg',
    identity_ok: true,
    placeholder_suspect: false,
  });
  const none = toStoredHeroReading(null, '2026-09-17T10:30:00.000Z');
  assert.equal(none.filename, null);
  assert.equal(none.identity_ok, false);
}

// Current hero classification mirrors the catalog audit.
assert.equal(currentHeroKind(null), 'none');
assert.equal(currentHeroKind(''), 'none');
assert.equal(currentHeroKind('/images/parts/placeholder.jpg'), 'placeholder');
assert.equal(
  currentHeroKind('https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/crown.webp'),
  'brand_logo'
);
assert.equal(currentHeroKind('/images/parts/jcb-716-c8932-throttle-pedal.jpg'), 'real');
assert.equal(
  currentHeroKind('https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/bobcat-7180668-track-tensioner.jpg'),
  'real'
);
// A part whose name happens to contain "logo" in a slug should not be misread.
assert.equal(currentHeroKind('/images/parts/jcb-catalogue-holder.jpg'), 'real');

// Seats, cushions and covers are excluded from vendor heroes entirely.
assert.equal(isSeatCategory('Seats'), true);
assert.equal(isSeatCategory('Seat cushions'), true);
assert.equal(isSeatCategory('Seat covers'), true);
assert.equal(isSeatCategory('seat'), true);
assert.equal(isSeatCategory('Construction Equipment Parts'), false);
assert.equal(isSeatCategory(null), false);
assert.equal(isSeatFamily('JCB Seats', 'JCB Operator Seat'), true);
assert.equal(isSeatFamily('Construction Equipment Parts', 'Bobcat Operator Seat Assembly'), true);
assert.equal(isSeatFamily('JCB General Parts', 'JCB 332/C4873 Replacement Part', 'seat-vinyl-jc332c4873.jpg'), true);
assert.equal(isSeatFamily('Construction Equipment Parts', 'JCB Lower Door 333/D2714'), false);

console.log('magHero.test.ts: all assertions passed');
