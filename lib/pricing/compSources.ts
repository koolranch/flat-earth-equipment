/**
 * Competitor URL builders for TVH-sourced aftermarket pricing.
 * Magnasource is confirmed TVH-aligned for benchmarking sell price.
 */

export type CompSourceId = 'magnasource' | 'intella' | 'gciron';

export type CompSource = {
  id: CompSourceId;
  name: string;
  /** TVH supply chain confidence for benchmarking */
  tvhAligned: boolean;
  buildUrl: (oemReference: string, brand?: string) => string | null;
};

/** Strip vendor prefixes and separators for Magnasource itemdetail URLs. */
export function toMagnasourcePartId(oemReference: string): string {
  return oemReference.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export const COMP_SOURCES: Record<CompSourceId, CompSource> = {
  magnasource: {
    id: 'magnasource',
    name: 'MagnaSource',
    tvhAligned: true,
    buildUrl: (oem) => `https://www.magnasourceinc.com/itemdetail/${toMagnasourcePartId(oem)}`,
  },
  intella: {
    id: 'intella',
    name: 'Intella Parts',
    tvhAligned: true,
    buildUrl: (oem) =>
      `https://www.intellaparts.com/catalogsearch/result/?q=${encodeURIComponent(oem)}`,
  },
  gciron: {
    id: 'gciron',
    name: 'GC Iron',
    tvhAligned: false,
    buildUrl: (oem, brand) => {
      if (brand?.toUpperCase() !== 'JLG') return null;
      const id = oem.replace(/^JL/i, '').replace(/[^0-9]/g, '');
      if (!id) return null;
      return `https://www.gciron.com/JLG_Parts_${id}_p/${id}.htm`;
    },
  },
};

/** Primary benchmark source by brand (Magnasource first for TVH-tagged SKUs). */
export function primaryCompUrl(oemReference: string, brand: string): string {
  const ms = COMP_SOURCES.magnasource.buildUrl(oemReference, brand);
  if (ms) return ms;
  const gc = COMP_SOURCES.gciron.buildUrl(oemReference, brand);
  if (gc) return gc;
  return COMP_SOURCES.intella.buildUrl(oemReference, brand)!;
}

export function allCompUrls(oemReference: string, brand: string): Array<{ source: CompSourceId; url: string }> {
  return (Object.values(COMP_SOURCES) as CompSource[])
    .map((s) => {
      const url = s.buildUrl(oemReference, brand);
      return url ? { source: s.id, url } : null;
    })
    .filter(Boolean) as Array<{ source: CompSourceId; url: string }>;
}
