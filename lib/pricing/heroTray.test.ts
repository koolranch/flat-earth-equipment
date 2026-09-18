import assert from 'node:assert/strict';
import {
  extForMime,
  heroApproveEligibility,
  heroRejectEligibility,
  heroUploadEligibility,
  sniffHeroMime,
  trayIntakeEligibility,
  type HeroReviewRow,
} from './heroTray';
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
      hero: { filename: 'seat-jc40910649.jpg' },
    })
  );
  assert.equal(seat.ok, false);
  if (!seat.ok) assert.match(seat.why, /seat/i);
}

{
  const named = trayIntakeEligibility(
    row({
      name: 'Bobcat Operator Seat Assembly',
      hero: { filename: 'bobcat-7505149.jpg' },
    })
  );
  assert.equal(named.ok, false);
}

{
  const byFile = trayIntakeEligibility(
    row({
      name: 'JCB 332/C4873 Replacement Part',
      hero: { filename: 'seat-vinyl-jc332c4873.jpg' },
    })
  );
  assert.equal(byFile.ok, false);
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
  assert.equal(heroUploadEligibility(row({ hero: { filename: 'x.jpg' } }), pending).ok, true);
  const approveRaw = heroApproveEligibility(row({ hero: { filename: 'x.jpg' } }), pending);
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

assert.equal(extForMime('image/png'), 'png');
assert.equal(extForMime('image/jpeg'), 'jpg');
assert.equal(sniffHeroMime(new Uint8Array([0xff, 0xd8, 0xff, 0x00])), 'image/jpeg');
assert.equal(sniffHeroMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png');

console.log('heroTray.test.ts: ok');
