/**
 * Competitor URL builders for TVH-sourced aftermarket pricing.
 * Magnasource is confirmed TVH-aligned for benchmarking sell price.
 */

import { buildMagItemUrl, magPartId } from '../parts/tvhOePrefixes';

export type CompSourceId = 'magnasource' | 'intella' | 'gciron';

export type CompSource = {
  id: CompSourceId;
  name: string;
  /** TVH supply chain confidence for benchmarking */
  tvhAligned: boolean;
  buildUrl: (oemReference: string, brand?: string) => string | null;
};

/**
 * Magnasource itemdetail id for an OEM number.
 *
 * Separators must survive: JCB needs its slash (JC333/D1629) and Toyota its dashes
 * (TY16420-U1280-71). A stripped id serves an HTTP 200 "no longer valid" page, so the
 * old strip-everything behaviour produced dead URLs for every JCB part.
 */
export function toMagnasourcePartId(oemReference: string, brand?: string): string | null {
  return magPartId(brand, oemReference);
}

export const COMP_SOURCES: Record<CompSourceId, CompSource> = {
  magnasource: {
    id: 'magnasource',
    name: 'MagnaSource',
    tvhAligned: true,
    buildUrl: (oem, brand) => buildMagItemUrl(brand, oem),
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
