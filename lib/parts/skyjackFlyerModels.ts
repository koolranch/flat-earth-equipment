/**
 * Skyjack featured-flyer model tokens (TVH 2608002T).
 *
 * The flyer is a marketing application list, not a serial-break catalog.
 * Do not write these tokens into parts.compatible_models as "verified"
 * fitment. Merge as an additive vendor-featured source only.
 */

export const SKYJACK_FLYER_ID = '2608002T';

export type FlyerModelFlag =
  | 'garbled_sjiii'
  | 'likely_sjiii_not_sjii'
  | 'missing_prefix'
  | 'rt_vs_compact';

export type NormalizedFlyerModel = {
  canonical: string;
  flags: FlyerModelFlag[];
};

const COMPACT_FAMILY = /^SJ\/SJIII\s+(\d{4})$/i;
const SJIII_ONLY = /^SJIII\s+(\d{4})$/i;
const SJII_ONLY = /^SJII\s+(\d{4})$/i;
const SJ_COMPACT = /^SJ\s+(\d{4})$/i;
const SJ_BARE = /^SJ(\d{4})$/i;
const SJ_RT = /^SJ(\d{4})\s+RT$/i;
const SJRT = /^SJRT\s+(\d{4})$/i;
const VERTICAL = /^SJ(12|16)$/i;
const BOOM = /^SJ(\d{2}(?:T|AJ))$/i;
const BARE_FOUR = /^(\d{4})$/;
const GARBLED_SJIII = /^SJ\/SJIIISJIII\s+(\d{4})$/i;
const LIKELY_SJII_TYPO = /^SJ\/SJII\s+(\d{4})$/i;

/**
 * Expand one flyer model token into canonical catalog keys.
 * Compact SJ/SJIII 3219 becomes two series. SJ6832 RT stays RT and is
 * never collapsed into SJ/SJIII 6832 (the flyer lists both separately).
 */
export function normalizeFlyerModelToken(raw: string): NormalizedFlyerModel[] {
  const token = raw.replace(/\s+/g, ' ').trim();
  if (!token) return [];

  const garbled = token.match(GARBLED_SJIII);
  if (garbled) {
    return compactFamily(garbled[1], ['garbled_sjiii']);
  }

  const likelyTypo = token.match(LIKELY_SJII_TYPO);
  if (likelyTypo) {
    return compactFamily(likelyTypo[1], ['likely_sjiii_not_sjii']);
  }

  const family = token.match(COMPACT_FAMILY);
  if (family) return compactFamily(family[1]);

  const sjiii = token.match(SJIII_ONLY);
  if (sjiii) return [{ canonical: `SJIII ${sjiii[1]}`, flags: [] }];

  const sjii = token.match(SJII_ONLY);
  if (sjii) return [{ canonical: `SJII ${sjii[1]}`, flags: [] }];

  const sjCompact = token.match(SJ_COMPACT);
  if (sjCompact) return [{ canonical: `SJ ${sjCompact[1]}`, flags: [] }];

  const rt = token.match(SJ_RT);
  if (rt) {
    return [{ canonical: `SJRT ${rt[1]}`, flags: ['rt_vs_compact'] }];
  }

  const sjrt = token.match(SJRT);
  if (sjrt) return [{ canonical: `SJRT ${sjrt[1]}`, flags: ['rt_vs_compact'] }];

  const vertical = token.match(VERTICAL);
  if (vertical) return [{ canonical: `SJ${vertical[1]}`, flags: [] }];

  const boom = token.match(BOOM);
  if (boom) return [{ canonical: `SJ${boom[1].toUpperCase()}`, flags: [] }];

  const bareSj = token.match(SJ_BARE);
  if (bareSj) {
    const n = bareSj[1];
    if (n === '12' || n === '16') return [{ canonical: `SJ${n}`, flags: [] }];
    return [{ canonical: `SJ${n}`, flags: [] }];
  }

  const bare = token.match(BARE_FOUR);
  if (bare) {
    return compactFamily(bare[1], ['missing_prefix']);
  }

  return [{ canonical: token, flags: [] }];
}

function compactFamily(n: string, flags: FlyerModelFlag[] = []): NormalizedFlyerModel[] {
  return [
    { canonical: `SJ ${n}`, flags },
    { canonical: `SJIII ${n}`, flags },
  ];
}

/** Split a flyer Models cell into raw tokens. */
export function splitFlyerModelsCell(cell: string): string[] {
  return cell
    .split(',')
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

export function normalizeFlyerModelsCell(cell: string): NormalizedFlyerModel[] {
  const seen = new Set<string>();
  const out: NormalizedFlyerModel[] = [];
  for (const raw of splitFlyerModelsCell(cell)) {
    for (const row of normalizeFlyerModelToken(raw)) {
      if (seen.has(row.canonical)) continue;
      seen.add(row.canonical);
      out.push(row);
    }
  }
  return out;
}

/**
 * Additive merge: flyer applications union existing catalog models.
 * Never drop a model that is already on the listing.
 */
export function mergeAdditiveFitment(
  existing: string[] | null | undefined,
  incoming: string[],
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const model of [...(existing ?? []), ...incoming]) {
    const key = model.replace(/\s+/g, ' ').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}
