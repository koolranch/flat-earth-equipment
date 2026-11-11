/**
 * Copy a Magnasource product hero through Firecrawl. This process never opens
 * its own connection to Magnasource. Firecrawl returns the original file as
 * base64 (`rawBase64`). A markdown scrape corrupts image bytes, so that path
 * is not used. A failed proxy read is a failed intake. There is no direct fetch.
 */

import { MAX_HERO_BYTES, sniffHeroMime } from './heroTray';

const FIRECRAWL_SCRAPE = 'https://api.firecrawl.dev/v2/scrape';

export function isMagGetImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (host !== 'www.magnasourceinc.com' && host !== 'magnasourceinc.com') return false;
    return parsed.pathname.startsWith('/services/getimage/');
  } catch {
    return false;
  }
}

export function bytesFromRawBase64(body: unknown): Uint8Array | null {
  if (!body || typeof body !== 'object') return null;
  const root = body as Record<string, unknown>;
  const data =
    root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : root;
  const raw = data.rawBase64 ?? data.raw_base64;
  if (typeof raw !== 'string' || raw.length < 32) return null;
  const buf = Buffer.from(raw, 'base64');
  if (buf.byteLength < 32 || buf.byteLength > MAX_HERO_BYTES) return null;
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

function hasImageTrailer(bytes: Uint8Array, mime: string): boolean {
  const n = bytes.length;
  if (mime === 'image/jpeg') return n >= 4 && bytes[n - 2] === 0xff && bytes[n - 1] === 0xd9;
  if (mime === 'image/png') {
    return n >= 8 && Buffer.from(bytes.subarray(n - 8, n - 4)).toString('ascii') === 'IEND';
  }
  if (mime === 'image/webp') {
    if (n < 12) return false;
    const size = bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24);
    return size + 8 === n;
  }
  return false;
}

export async function fetchMagHeroBytes(
  url: string,
  apiKey: string
): Promise<{ bytes: Uint8Array; mime: string }> {
  if (!isMagGetImageUrl(url)) {
    throw new Error('hero url is not a Magnasource getimage path');
  }
  const res = await fetch(FIRECRAWL_SCRAPE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      formats: ['rawBase64'],
      maxAge: 0,
      timeout: 60_000,
    }),
  });
  if (!res.ok) throw new Error(`hero proxy ${res.status}`);
  const bytes = bytesFromRawBase64(await res.json());
  const mime = bytes ? sniffHeroMime(bytes) : null;
  if (!bytes || !mime || !hasImageTrailer(bytes, mime)) {
    throw new Error('hero proxy returned no intact image');
  }
  return { bytes, mime };
}
