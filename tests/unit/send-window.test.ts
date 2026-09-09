import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nextDaytimeSlot } from '../../lib/training/sendWindow';

// September = CDT (UTC-5). 10:15 Central == 15:15Z.
const central = (iso: string) => new Date(iso);

test('a target already inside 10:00–17:00 Central is returned unchanged', () => {
  const t = central('2026-09-09T18:30:00Z'); // 13:30 CDT
  assert.equal(nextDaytimeSlot(t).toISOString(), t.toISOString());
});

test('a late-night target rolls to 10:15 Central the next day', () => {
  const t = central('2026-09-10T04:38:00Z'); // 23:38 CDT on Sep 9
  assert.equal(nextDaytimeSlot(t).toISOString(), '2026-09-10T15:15:00.000Z');
});

test('an early-morning target moves to 10:15 Central the same day', () => {
  const t = central('2026-09-10T11:05:00Z'); // 06:05 CDT on Sep 10
  assert.equal(nextDaytimeSlot(t).toISOString(), '2026-09-10T15:15:00.000Z');
});

test('exactly at close (17:00) rolls to next day; just before close stays', () => {
  assert.equal(nextDaytimeSlot(central('2026-09-10T22:00:00Z')).toISOString(), '2026-09-11T15:15:00.000Z');
  const before = central('2026-09-10T21:59:00Z');
  assert.equal(nextDaytimeSlot(before).toISOString(), before.toISOString());
});

test('never returns a slot earlier than the target', () => {
  for (let h = 0; h < 24; h++) {
    const t = new Date(Date.UTC(2026, 8, 9, h, 7));
    assert.ok(nextDaytimeSlot(t).getTime() >= t.getTime(), `hour ${h}`);
  }
});

test('handles standard time (January, CST = UTC-6)', () => {
  const t = central('2027-01-13T05:00:00Z'); // 23:00 CST Jan 12
  assert.equal(nextDaytimeSlot(t).toISOString(), '2027-01-13T16:15:00.000Z');
});

test('skipWeekends rolls Saturday and Sunday to Monday 10:15 Central', () => {
  // Sat Sep 12 2026, 13:00 CDT — inside hours but weekend.
  assert.equal(
    nextDaytimeSlot(central('2026-09-12T18:00:00Z'), { skipWeekends: true }).toISOString(),
    '2026-09-14T15:15:00.000Z',
  );
  // Fri Sep 11 2026, 22:30 CDT — after close, next day is Saturday.
  assert.equal(
    nextDaytimeSlot(central('2026-09-12T03:30:00Z'), { skipWeekends: true }).toISOString(),
    '2026-09-14T15:15:00.000Z',
  );
  // Without the flag, Saturday daytime is fine.
  const sat = central('2026-09-12T18:00:00Z');
  assert.equal(nextDaytimeSlot(sat).toISOString(), sat.toISOString());
});

test('recovery follow-up uses the daytime window; first email stays immediate', () => {
  const src = readFileSync('lib/training/checkoutRecovery.server.ts', 'utf8');
  assert.match(src, /nextDaytimeSlot\(new Date\(Date\.now\(\) \+ FOLLOWUP_DELAY_MS\)\)/);
  // The first send has no scheduledAt.
  const firstSend = src.slice(src.indexOf('gfcCheckoutRecoveryFirstEmail({'), src.indexOf('gfcCheckoutRecoverySecondEmail({'));
  assert.doesNotMatch(firstSend, /scheduledAt/);
});
