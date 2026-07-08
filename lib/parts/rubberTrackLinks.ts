/**
 * Static model → primary track-listing links for cross-linking from
 * serial-lookup pages and other static contexts. Keep in sync with the
 * published Rubber Tracks catalog (data/tracks/rubber-track-intake.csv).
 */

export type TrackModelLink = {
  /** Customer-facing machine model label, e.g. "T650" */
  model: string;
  /** Primary PDP slug for this model's tracks */
  slug: string;
};

export const RUBBER_TRACK_MODEL_LINKS: Record<string, TrackModelLink[]> = {
  bobcat: [
    { model: 'T650', slug: 'bobcat-t650-rubber-track-450x86x52' },
    { model: 'T770', slug: 'bobcat-t770-rubber-track-450x86x55' },
    { model: 'T590', slug: 'bobcat-t590-rubber-track-320x86x49' },
    { model: 'T550', slug: 'bobcat-t550-rubber-track-320x86x49' },
    { model: 'T190', slug: 'bobcat-t190-rubber-track-320x86x49' },
    { model: 'T66', slug: 'bobcat-t66-rubber-track-320x86x50' },
    { model: 'MT85', slug: 'bobcat-mt85-rubber-track-180x72x45' },
  ],
  caterpillar: [
    { model: '259D / 259D3', slug: 'caterpillar-259d-rubber-track-400x86x53' },
    { model: '289D', slug: 'caterpillar-289d-rubber-track-450x86x56' },
  ],
  kubota: [
    { model: 'SVL65-2', slug: 'kubota-svl65-2-rubber-track-320x86x52' },
    { model: 'SVL75 / SVL75-2', slug: 'kubota-svl75-rubber-track-320x86x52' },
    { model: 'SVL95-2S / SVL95-2SC', slug: 'kubota-svl95-rubber-track-450x86x58' },
  ],
  takeuchi: [
    { model: 'TL8', slug: 'takeuchi-tl8-rubber-track-320x86x52' },
    { model: 'TL8R2', slug: 'takeuchi-tl8r2-rubber-track-400x86x52' },
  ],
  case: [
    { model: 'TR270', slug: 'case-tr270-rubber-track-320x86x50' },
    { model: 'TR310', slug: 'case-tr310-rubber-track-320x86x50' },
    { model: 'TV370', slug: 'case-tv370-rubber-track-450x86x55' },
    { model: 'TV450', slug: 'case-tv450-rubber-track-450x86x55' },
  ],
  'john deere': [
    { model: '333G', slug: 'john-deere-333g-rubber-track-450x86x58' },
    { model: '325G', slug: 'john-deere-325g-rubber-track-320x86x52' },
  ],
  jcb: [
    { model: '1CXT', slug: 'jcb-1cxt-rubber-track-320x86x50' },
    { model: '150T', slug: 'jcb-150t-rubber-track-320x86x48' },
    { model: '190T', slug: 'jcb-190t-rubber-track-320x86x50' },
    { model: '190T ECO', slug: 'jcb-190t-eco-rubber-track-320x86x50' },
  ],
};

export function getTrackLinksForBrand(brand: string): TrackModelLink[] {
  return RUBBER_TRACK_MODEL_LINKS[brand.trim().toLowerCase()] ?? [];
}
