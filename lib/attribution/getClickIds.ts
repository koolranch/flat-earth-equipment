'use client';

/**
 * Google Ads click identifiers used to attribute Stripe sales back to ad clicks.
 * Only keys with a value are populated.
 */
export interface ClickIds {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
}

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1');
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + escaped + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Reads Google click ids on the client, in priority order:
 *   1. URL query params (`gclid`, `gbraid`, `wbraid`)
 *   2. Fallback for gclid only: the `_gcl_aw` cookie (set by gtag.js)
 *
 * The `_gcl_aw` cookie is formatted as `GCL.<timestamp>.<gclid>`, so we extract
 * the gclid portion when present. Mirrors how lib/safety/traffic-source.ts
 * detects ad traffic via gclid / _gcl_aw.
 *
 * Returns only the keys that have values.
 */
export function getClickIds(): ClickIds {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const result: ClickIds = {};

  const gclidParam = (params.get('gclid') || '').trim();
  if (gclidParam) {
    result.gclid = gclidParam;
  } else {
    const cookie = readCookie('_gcl_aw').trim();
    if (cookie) {
      const segments = cookie.split('.');
      result.gclid = segments.length >= 3 ? segments.slice(2).join('.') : cookie;
    }
  }

  const gbraid = (params.get('gbraid') || '').trim();
  if (gbraid) result.gbraid = gbraid;

  const wbraid = (params.get('wbraid') || '').trim();
  if (wbraid) result.wbraid = wbraid;

  return result;
}
