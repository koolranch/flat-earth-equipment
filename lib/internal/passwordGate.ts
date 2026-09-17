/**
 * Shared-password gate for internal, read-only operations pages.
 *
 * This is deliberately not the customer or staff auth system. It guards internal tooling
 * that reads vendor state and displays it — it must never be used to protect anything that
 * writes, spends, or exposes customer data. Routes behind it are noindexed and disallowed
 * in robots.txt.
 *
 * The cookie holds an HMAC derived from the configured password, so a valid cookie can only
 * be produced by someone who knew the password, and changing the password invalidates every
 * existing session. The password itself is never written to the cookie or to git.
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const PARTS_WATCH_COOKIE = 'fee_parts_watch';
export const PARTS_WATCH_ENV = 'PARTS_WATCH_PASSWORD';
export const PARTS_WATCH_PATH = '/parts-watch';

const SESSION_DAYS = 30;

function configuredPassword(): string | null {
  const value = process.env[PARTS_WATCH_ENV];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** Derived session token. Knowing it requires knowing the password. */
function tokenFor(password: string): string {
  return createHmac('sha256', password).update('parts-watch-session-v1').digest('hex');
}

function equals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export type GateStatus = 'unlocked' | 'locked' | 'not_configured';

export function partsWatchStatus(): GateStatus {
  const password = configuredPassword();
  if (!password) return 'not_configured';

  const cookie = cookies().get(PARTS_WATCH_COOKIE)?.value;
  if (!cookie) return 'locked';

  return equals(cookie, tokenFor(password)) ? 'unlocked' : 'locked';
}

/**
 * Verify a submitted password and start a session. Returns false on a wrong password.
 * Only callable from a Server Action or Route Handler, since it writes a cookie.
 */
export function unlockPartsWatch(submitted: string): boolean {
  const password = configuredPassword();
  if (!password) return false;
  if (!equals(submitted.trim(), password)) return false;

  cookies().set(PARTS_WATCH_COOKIE, tokenFor(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: PARTS_WATCH_PATH,
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return true;
}

export function lockPartsWatch(): void {
  cookies().delete({ name: PARTS_WATCH_COOKIE, path: PARTS_WATCH_PATH });
}
