import assert from 'node:assert/strict';
import {
  extForMime,
  heroAiCleanEligibility,
  heroApproveEligibility,
  heroRejectEligibility,
  heroUploadEligibility,
  sniffHeroMime,
  trayIntakeEligibility,
  weekdayHeroIntakeEligibility,
  type HeroReviewRow,
} from './heroTray';
import { emptyHeroIntakeBudget, takeHeroIntakeSlot } from './magWatchLimits';
import type { WatchRow } from './magWatchUniverse';

function row(overrides: Partial<WatchRow> & { hero?: { filename: string; identityOk?: boolean; placeholder?: boolean } }): WatchRow {
  const hero = overrides.hero;
  const { hero: _drop, ...rest } = overrides;
  return {
    id: 'row-1',
    sku: '333D2714',
    slug: 'jcb-333-d2714-lower-door',
    name: 'JCB Lower Door 333/D2714',
    brand: 'JCB',
    category: 'Construction Equipment Parts',
    category_slug: 'construction-equipment-parts',
    sales_type: 'quote_only',
    is_in_stock: false,
    price: null,
    price_cents: null,
    oem_reference: '333/D2714',
    stripe_price_id: null,
    stripe_product_id: null,
    image_url: null,
    metadata: {
      mag_watch: {
        last_checked_at: '2026-09-17T12:00:00.000Z',
        hero: hero
          ? {
              checked_at: '2026-09-17T12:00:00.000Z',
              filename: hero.filename,
              identity_ok: hero.identityOk !== false,
              placeholder_suspect: hero.placeholder === true,
            }
          : undefined,
      },
    },
    ...rest,
  };
}

function review(overrides: Partial<HeroReviewRow> = {}): HeroReviewRow {
  return {
    sku: '333D2714',
    part_id: 'row-1',
    slug: 'jcb-333-d2714-lower-door',
    status: 'pending_raw',
    raw_path: '333D2714/raw.jpg',
    cleaned_path: null,
    public_url: null,
    filename: 'jcb-333d2714-123.jpg',
    identity_ok: true,
    mag_price: 890,
    proposed_sell: 845,
    qty_on_hand: 4,
    note: null,
    ...overrides,
  };
}

{
  const ok = trayIntakeEligibility(
    row({ hero: { filename: 'lower-door-jc333d2714.jpg' } })
  );
  assert.equal(ok.ok, true);
}

{
  const seat = trayIntakeEligibility(
    row({
      category: 'JCB Seats',
      name: 'JCB Operator Seat',
      oem_reference: '40/910649',
      sku: '40910649',
      hero: { filename: 'seat-jc40910649.jpg' },
    })
  );
  assert.equal(seat.ok, true);
}

{
  const named = trayIntakeEligibility(
    row({
      name: 'Bobcat Operator Seat Assembly',
      oem_reference: '7505149',
      sku: '7505149',
      hero: { filename: 'bobcat-7505149.jpg' },
    })
  );
  assert.equal(named.ok, true);
}

{
  const byFile = trayIntakeEligibility(
    row({
      name: 'JCB 332/C4873 Replacement Part',
      oem_reference: '332/C4873',
      sku: '332C4873',
      hero: { filename: 'seat-vinyl-jc332c4873.jpg' },
    })
  );
  assert.equal(byFile.ok, true);
}

{
  const charger = trayIntakeEligibility(
    row({
      name: 'JCB 444/E0383 BATTERY CHARGER',
      hero: { filename: 'battery-charger-jc444e0383.jpg' },
    })
  );
  assert.equal(charger.ok, false);
}

{
  const hasPhoto = trayIntakeEligibility(
    row({
      image_url: '/images/parts/jcb-333-d2714-lower-door.jpg',
      hero: { filename: 'lower-door-jc333d2714.jpg' },
    })
  );
  assert.equal(hasPhoto.ok, false);
}

{
  const badId = trayIntakeEligibility(
    row({ hero: { filename: 'other-brand-999.jpg', identityOk: false } })
  );
  assert.equal(badId.ok, false);
}

{
  const placeholder = trayIntakeEligibility(
    row({ hero: { filename: 'no-image.jpg', placeholder: true } })
  );
  assert.equal(placeholder.ok, false);
}

{
  const pending = review();
  const part = row({ hero: { filename: 'x.jpg' } });
  assert.equal(heroUploadEligibility(part, pending).ok, true);
  assert.equal(heroAiCleanEligibility(part, pending).ok, true);
  assert.equal(heroAiCleanEligibility(part, review({ raw_path: null })).ok, false);
  const approveRaw = heroApproveEligibility(part, pending);
  assert.equal(approveRaw.ok, false);
  if (!approveRaw.ok) assert.match(approveRaw.why, /cleaned/i);
}

{
  const cleaned = review({ status: 'cleaned', cleaned_path: '333D2714/cleaned.jpg' });
  assert.equal(heroApproveEligibility(row({ hero: { filename: 'x.jpg' } }), cleaned).ok, true);
}

{
  const approved = review({ status: 'approved', cleaned_path: '333D2714/cleaned.jpg' });
  assert.equal(heroApproveEligibility(row({ hero: { filename: 'x.jpg' } }), approved).ok, false);
  assert.equal(heroRejectEligibility(approved).ok, false);
  assert.equal(heroRejectEligibility(review()).ok, true);
}

{
  const ready = row({ hero: { filename: 'lower-door-jc333d2714.jpg' } });
  const og = 'https://www.magnasourceinc.com/services/getimage/lower-door-jc333d2714.jpg?key=x';
  assert.equal(
    weekdayHeroIntakeEligibility(ready, { availability: 'in_stock', ogImage: og }).ok,
    true
  );
  const limited = weekdayHeroIntakeEligibility(ready, { availability: 'limited', ogImage: og });
  assert.equal(limited.ok, false);
  const skip = weekdayHeroIntakeEligibility(ready, {
    availability: 'in_stock',
    ogImage: og,
    skipOems: new Set(['333/D2714']),
  });
  assert.equal(skip.ok, false);
  const heavy = weekdayHeroIntakeEligibility(ready, {
    availability: 'in_stock',
    ogImage: og,
    weightLb: 106,
  });
  assert.equal(heavy.ok, false);
}

{
  const budget = emptyHeroIntakeBudget(40, 32);
  assert.equal(budget.quote, 32);
  assert.equal(budget.buyNow, 8);
  let taken = 0;
  for (let i = 0; i < 40; i++) taken += takeHeroIntakeSlot(true, budget) ? 1 : 0;
  assert.equal(taken, 8, 'Buy Now cannot spend the quote-only reserve');
  const quotes = emptyHeroIntakeBudget();
  for (let i = 0; i < 32; i++) assert.equal(takeHeroIntakeSlot(false, quotes), true);
  assert.equal(takeHeroIntakeSlot(false, quotes), false);
}

assert.equal(extForMime('image/png'), 'png');
assert.equal(extForMime('image/jpeg'), 'jpg');
assert.equal(sniffHeroMime(new Uint8Array([0xff, 0xd8, 0xff, 0x00])), 'image/jpeg');
assert.equal(sniffHeroMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png');

console.log('heroTray.test.ts: ok');
