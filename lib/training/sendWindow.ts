/**
 * Daytime send window for scheduled marketing follow-ups.
 *
 * A follow-up that lands at 11:40 PM sits under a night of spam by morning.
 * We don't know a recipient's timezone, so the window is anchored on US
 * Central — 10:00–17:00 Central is 11–6 Eastern and 8–3 Pacific, inside
 * working hours for the whole contiguous US.
 */

export const SEND_WINDOW_TZ = 'America/Chicago';
export const SEND_WINDOW_OPEN_HOUR = 10; // inclusive
export const SEND_WINDOW_CLOSE_HOUR = 17; // exclusive
const SLOT_MINUTE = 15; // 10:15 — clear of the top-of-the-hour send rush

type LocalParts = { year: number; month: number; day: number; hour: number; minute: number };

function localParts(date: Date, timeZone: string): LocalParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
  const get = (type: string) => Number(fmt.formatToParts(date).find(p => p.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') };
}

/** Milliseconds to add to a UTC instant to get wall-clock time in `timeZone`. */
function tzOffsetMs(date: Date, timeZone: string): number {
  const p = localParts(date, timeZone);
  const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  const utc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
  );
  return wall - utc;
}

/** The instant corresponding to `hour:minute` wall-clock on the given local calendar day. */
function atLocalTime(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): Date {
  const naive = new Date(Date.UTC(year, month - 1, day, hour, minute));
  // First guess uses the offset at the naive instant; re-derive once so DST
  // transitions on the target day resolve correctly.
  let out = new Date(naive.getTime() - tzOffsetMs(naive, timeZone));
  out = new Date(naive.getTime() - tzOffsetMs(out, timeZone));
  return out;
}

export type SendWindowOptions = {
  timeZone?: string;
  /** Roll Saturday/Sunday slots to Monday. Use for employer-facing mail, not consumer recovery. */
  skipWeekends?: boolean;
};

function isWeekend(year: number, month: number, day: number): boolean {
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return dow === 0 || dow === 6;
}

/**
 * Returns `target` if it already falls inside the daytime window, otherwise
 * the next window opening (10:15 Central) — same day if `target` is before
 * opening, next day if it is after closing. With `skipWeekends`, any slot on
 * Saturday/Sunday moves to Monday's opening. Never returns a time earlier
 * than `target`.
 */
export function nextDaytimeSlot(target: Date, options: SendWindowOptions = {}): Date {
  const timeZone = options.timeZone ?? SEND_WINDOW_TZ;
  const p = localParts(target, timeZone);
  const inHours = p.hour >= SEND_WINDOW_OPEN_HOUR && p.hour < SEND_WINDOW_CLOSE_HOUR;
  const weekendBlocked = options.skipWeekends === true && isWeekend(p.year, p.month, p.day);
  if (inHours && !weekendBlocked) return target;

  // Candidate calendar day: today if before opening (and not a blocked
  // weekend), otherwise tomorrow; then walk forward past any blocked weekend.
  let dayOffset = p.hour < SEND_WINDOW_OPEN_HOUR && !weekendBlocked ? 0 : 1;
  for (;;) {
    const d = new Date(Date.UTC(p.year, p.month - 1, p.day + dayOffset));
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const dd = d.getUTCDate();
    if (options.skipWeekends === true && isWeekend(y, m, dd)) {
      dayOffset += 1;
      continue;
    }
    return atLocalTime(y, m, dd, SEND_WINDOW_OPEN_HOUR, SLOT_MINUTE, timeZone);
  }
}
