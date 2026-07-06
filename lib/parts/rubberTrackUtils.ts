import { sanitizeCustomerFacingCopy } from '@/lib/parts/displayBrand';

export type TrackSizeParts = {
  widthMm: number;
  pitchMm: number;
  links: number;
  widthIn: string;
};

/** Parse metadata or slug size string like 450x86x55. */
export function parseTrackSize(size: string | undefined): TrackSizeParts | null {
  if (!size) return null;
  const match = size.match(/^(\d+)x(\d+)x(\d+)/i);
  if (!match) return null;
  const widthMm = Number(match[1]);
  const pitchMm = Number(match[2]);
  const links = Number(match[3]);
  if (!widthMm || !pitchMm || !links) return null;
  return {
    widthMm,
    pitchMm,
    links,
    widthIn: (widthMm / 25.4).toFixed(1),
  };
}

/** First paragraph only — omits fitment/shipping blocks stored in Supabase description. */
export function getRubberTrackIntro(description: string | undefined): string {
  if (!description) return '';
  const clean = sanitizeCustomerFacingCopy(description);
  return clean.split('\n\n')[0]?.trim() ?? clean;
}

export type RelatedTrack = {
  slug: string;
  name: string;
  price: number;
  size: string;
  treadPattern: string;
};

export function formatTrackLabel(track: RelatedTrack): string {
  const size = track.size.replace(/x/gi, '×');
  const tread =
    track.treadPattern.charAt(0).toUpperCase() + track.treadPattern.slice(1);
  return `${size} ${tread}`;
}
