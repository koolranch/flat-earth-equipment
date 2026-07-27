'use client';

/**
 * Google Ads click identifiers used to attribute Stripe sales back to ad clicks.
 * Only keys with a value are populated.
 *
 * Persistence:
 *   - URL params are captured on first read and written to localStorage + cookies
 *   - Later navigations (e.g. /safety?state=oh → #pricing, or SPA soft-nav that
 *     drops query) still return the stored ids so Checkout metadata gets them.
 *   - Cookies (fee_gclid / fee_gbraid / fee_wbraid) let server actions (exam unlock)
 *     attach the same ids without a client FormData path.
 */

import {
  mergeClickIds,
  parseGclAwCookie,
  type ClickIds,
} from '@/lib/attribution/mergeClickIds';

export type { ClickIds };
export { mergeClickIds, parseGclAwCookie };

const STORAGE_KEY = 'fee_click_ids';
const COOKIE_MAX_AGE_SEC = 90 * 24 * 60 * 60; // 90 days (Ads click window)

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1');
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + escaped + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

function readStored(): ClickIds {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ClickIds;
    const out: ClickIds = {};
    if (typeof parsed.gclid === 'string' && parsed.gclid.trim()) out.gclid = parsed.gclid.trim();
    if (typeof parsed.gbraid === 'string' && parsed.gbraid.trim()) out.gbraid = parsed.gbraid.trim();
    if (typeof parsed.wbraid === 'string' && parsed.wbraid.trim()) out.wbraid = parsed.wbraid.trim();
    return out;
  } catch {
    return {};
  }
}

function persist(ids: ClickIds): void {
  if (typeof window === 'undefined') return;
  if (!ids.gclid && !ids.gbraid && !ids.wbraid) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // private mode / quota — cookies still help server actions
  }
  if (ids.gclid) writeCookie('fee_gclid', ids.gclid);
  if (ids.gbraid) writeCookie('fee_gbraid', ids.gbraid);
  if (ids.wbraid) writeCookie('fee_wbraid', ids.wbraid);
}

/**
 * Reads Google click ids on the client, in priority order per key:
 *   1. URL query params (`gclid`, `gbraid`, `wbraid`)
 *   2. Fallback for gclid only: the `_gcl_aw` cookie (set by gtag.js)
 *   3. Previously persisted localStorage / fee_* cookies
 *
 * Side effect: persists any resolved ids for later checkout on this device.
 */
export function getClickIds(): ClickIds {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const fromUrl: ClickIds = {};

  const gclidParam = (params.get('gclid') || '').trim();
  if (gclidParam) {
    fromUrl.gclid = gclidParam;
  } else {
    const fromGclAw = parseGclAwCookie(readCookie('_gcl_aw'));
    if (fromGclAw) fromUrl.gclid = fromGclAw;
  }

  const gbraid = (params.get('gbraid') || '').trim();
  if (gbraid) fromUrl.gbraid = gbraid;

  const wbraid = (params.get('wbraid') || '').trim();
  if (wbraid) fromUrl.wbraid = wbraid;

  const stored = readStored();
  // Cookie fallback if localStorage was cleared but fee_* cookies remain
  if (!stored.gclid) {
    const feeGclid = readCookie('fee_gclid').trim();
    if (feeGclid) stored.gclid = feeGclid;
  }
  if (!stored.gbraid) {
    const feeGbraid = readCookie('fee_gbraid').trim();
    if (feeGbraid) stored.gbraid = feeGbraid;
  }
  if (!stored.wbraid) {
    const feeWbraid = readCookie('fee_wbraid').trim();
    if (feeWbraid) stored.wbraid = feeWbraid;
  }

  const merged = mergeClickIds(fromUrl, stored);
  if (fromUrl.gclid || fromUrl.gbraid || fromUrl.wbraid) {
    persist(merged);
  } else if (merged.gclid || merged.gbraid || merged.wbraid) {
    // Refresh cookie expiry when reading from storage
    persist(merged);
  }

  return merged;
}
