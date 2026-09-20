/** Shared TVH warehouse identity for a rubber track (size + tread), not a catalog slug. */

const SIZE_RE = /(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+)/;

export function normalizeTrackSize(text: string): string | null {
  const match = text.match(SIZE_RE);
  if (!match) return null;
  return `${match[1]}x${match[2]}x${match[3]}`.toLowerCase();
}

export function isTrackBeltName(text: string | null | undefined): boolean {
  if (!text) return false;
  if (/\bidler\b/i.test(text)) return false;
  return /rubber\s+track|track\s*-?\s*rubber/i.test(text);
}

export function trackPatternFromText(text: string): string | null {
  const t = text.toLowerCase();
  if (/\bidler\b/.test(t)) return null;
  if (/\bzig[\s-]?zag\b/.test(t)) return 'zigzag';
  if (/\bstraight[\s-]?bar\b/.test(t)) return 'straight-bar';
  if (/\bmulti[\s-]?bar\b/.test(t)) return 'multibar';
  if (/\bbridgestone\b/.test(t)) return 'bridgestone';
  if (/\bblock\b/.test(t)) return 'block';
  if (/\bc[\s-]?pattern\b|\bb-style,?\s*c\b/.test(t)) return 'c';
  return null;
}

/** `TSA/SY320X86X50C` → size + C/Z letter. House SY numbers without a size return null. */
export function trackPatternFromVendorPn(pn: string): string | null {
  const match = pn.match(/(\d+(?:\.\d+)?[xX]\d+(?:\.\d+)?[xX]\d+)([A-Za-z])?\b/);
  if (!match) return null;
  const letter = (match[2] ?? '').toUpperCase();
  if (letter === 'Z') return 'zigzag';
  if (letter === 'C') return 'c';
  return letter ? letter.toLowerCase() : null;
}

export type TrackKeyInput = {
  name?: string | null;
  categorySlug?: string | null;
  vendorPn?: string | null;
  magTitle?: string | null;
};

export function trackWarehouseKey(input: TrackKeyInput): string | null {
  const hay = `${input.magTitle ?? ''} ${input.name ?? ''} ${input.vendorPn ?? ''}`;
  if (/\bidler\b/i.test(hay)) return null;

  const looksLikeTrack =
    input.categorySlug === 'rubber-tracks' || isTrackBeltName(hay);
  if (!looksLikeTrack) return null;

  const size =
    (input.vendorPn && normalizeTrackSize(input.vendorPn)) ||
    (input.magTitle && normalizeTrackSize(input.magTitle)) ||
    (input.name && normalizeTrackSize(input.name));
  if (!size) return null;

  const pattern =
    (input.vendorPn && trackPatternFromVendorPn(input.vendorPn)) ||
    (input.magTitle && trackPatternFromText(input.magTitle)) ||
    (input.name && trackPatternFromText(input.name));
  if (!pattern) return null;

  return `${size}|${pattern}`;
}
