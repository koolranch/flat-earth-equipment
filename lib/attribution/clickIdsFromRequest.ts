/**
 * Server-side helpers to collect Google click ids from FormData and/or cookies.
 * Used by training checkout server actions.
 */

import { cookies } from 'next/headers';
import { mergeClickIds, type ClickIds } from '@/lib/attribution/mergeClickIds';

const CLICK_KEYS = ['gclid', 'gbraid', 'wbraid'] as const;

export type ServerClickIds = ClickIds;

export function clickIdsFromFormData(formData: FormData): ServerClickIds {
  const out: ServerClickIds = {};
  for (const key of CLICK_KEYS) {
    const value = formData.get(key);
    if (typeof value === 'string' && value.trim()) {
      out[key] = value.trim();
    }
  }
  return out;
}

/**
 * fee_* cookies written by getClickIds() on the client (90-day Ads window).
 * Fills any keys missing from FormData (hydration race / exam-unlock path).
 */
export function clickIdsFromCookies(): ServerClickIds {
  const jar = cookies();
  const out: ServerClickIds = {};
  for (const key of CLICK_KEYS) {
    const value = jar.get(`fee_${key}`)?.value?.trim();
    if (value) out[key] = value;
  }
  return out;
}

export function mergeServerClickIds(
  primary: ServerClickIds,
  fallback: ServerClickIds,
): ServerClickIds {
  return mergeClickIds(primary, fallback);
}
