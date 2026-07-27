/**
 * Pure click-id merge helpers (no DOM / Next APIs).
 * Shared by client getClickIds and server checkout actions.
 */

export type ClickIds = {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
};

/** Parse gtag `_gcl_aw` cookie value → gclid. */
export function parseGclAwCookie(cookie: string): string | undefined {
  const trimmed = cookie.trim();
  if (!trimmed) return undefined;
  const segments = trimmed.split('.');
  // Format: GCL.<timestamp>.<gclid>
  return segments.length >= 3 ? segments.slice(2).join('.') : trimmed;
}

/**
 * Last-touch merge: incoming URL/cookie values overwrite stored keys when present;
 * otherwise keep stored.
 */
export function mergeClickIds(incoming: ClickIds, stored: ClickIds): ClickIds {
  return {
    ...(stored.gclid || incoming.gclid
      ? { gclid: incoming.gclid || stored.gclid }
      : {}),
    ...(stored.gbraid || incoming.gbraid
      ? { gbraid: incoming.gbraid || stored.gbraid }
      : {}),
    ...(stored.wbraid || incoming.wbraid
      ? { wbraid: incoming.wbraid || stored.wbraid }
      : {}),
  };
}
