/** Equipment brands from the vendor seat guide — never use the vendor name as brand. */
export const SEAT_BRAND_HEADERS: Record<string, string> = {
  ADVANCE: 'Advance',
  'AMERICAN LINCOLN': 'American Lincoln',
  BOBCAT: 'Bobcat',
  COLUMBIA: 'Columbia',
  CATERPILLIAR: 'Caterpillar',
  CATERPILLAR: 'Caterpillar',
  'FACTORY CAT': 'Factory Cat',
  GEHL: 'Gehl',
  GENIE: 'Genie',
  JBC: 'JCB',
  JCB: 'JCB',
  JLG: 'JLG',
  'LANCER BOSS': 'Lancer Boss',
  LULL: 'Lull',
  MINUTEMAN: 'Minuteman',
  MANITOU: 'Manitou',
  POWERBOSS: 'Powerboss',
  MERLO: 'Merlo',
  SKYJACK: 'Skyjack',
  SKYTRACK: 'Skytrack',
  'TAYLOR DUNN': 'Taylor Dunn',
  TENNANT: 'Tennant',
  TEREX: 'Terex',
  CUSHMAN: 'Cushman',
  'E-Z-GO': 'E-Z-GO',
};

/** Map OEM prefix → default brand (OEM prefix wins over PDF section headers). */
export const OEM_PREFIX_BRAND: Record<string, string> = {
  AD: 'Advance',
  AM: 'American Lincoln',
  BC: 'Bobcat',
  CO: 'Columbia',
  CT: 'Caterpillar',
  FC: 'Factory Cat',
  GN: 'Genie',
  GB: 'Genie',
  JC: 'JCB',
  JL: 'JLG',
  LB: 'Lancer Boss',
  LU: 'Lull',
  MH: 'Minuteman',
  MN: 'Manitou',
  PB: 'Powerboss',
  RF: 'Merlo',
  SJ: 'Skyjack',
  SA: 'Skytrack',
  TA: 'Taylor Dunn',
  TN: 'Tennant',
  TX: 'Terex',
  EZ: 'E-Z-GO',
  CU: 'Cushman',
};

const OEM_PREFIXES = Object.keys(OEM_PREFIX_BRAND).sort((a, b) => b.length - a.length);

export function normalizeBrand(raw: string): string | null {
  const key = raw.trim().toUpperCase().replace(/\s+/g, ' ');
  return SEAT_BRAND_HEADERS[key] ?? null;
}

export function brandSlug(brand: string): string {
  return brand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function inferBrandFromOem(oem: string, fallback?: string): string {
  const upper = oem.toUpperCase();
  for (const prefix of OEM_PREFIXES) {
    if (upper.startsWith(prefix)) {
      return OEM_PREFIX_BRAND[prefix];
    }
  }
  return fallback ?? 'Industrial Equipment';
}

function parseTripleDims(block: string): number[] | null {
  const nums = block.match(/(\d+\.\d+)"/g)?.map((v) => parseFloat(v));
  return nums && nums.length >= 3 ? nums.slice(0, 3) : null;
}

function splitAssemblyLineByDims(line: string): { oem: string; rest: string } | null {
  const triple = /(\d+\.\d+"\s*x\s*\d+\.\d+"\s*x\s*\d+\.\d+")/i;
  const first = line.match(triple);
  if (!first || first.index == null) return null;

  let start = first.index;
  let block = line.slice(start).match(triple)?.[1];
  let nums = block ? parseTripleDims(block) : null;

  // PDF text often glues trailing PN digits onto the first dimension (8722+24.49 → 872224.49).
  if (nums && nums[0] > 72) {
    const after = line.slice(start);
    const dotIdx = after.indexOf('.');
    if (dotIdx >= 2) {
      start = start + dotIdx - 2;
      block = line.slice(start).match(triple)?.[1];
      nums = block ? parseTripleDims(block) : null;
    }
  }

  if (!nums || nums.some((n) => n < 3 || n > 72)) return null;

  const oem = line.slice(0, start).trim();
  if (oem.length < 4) return null;

  return { oem, rest: line.slice(start) };
}

/** Split a compact PDF line into OEM part number + remainder. */
export function splitOemFromLine(line: string): { oem: string; rest: string } | null {
  for (const prefix of OEM_PREFIXES) {
    if (!line.toUpperCase().startsWith(prefix)) continue;

    const assembly = splitAssemblyLineByDims(line);
    if (assembly && assembly.oem.toUpperCase().startsWith(prefix)) {
      return assembly;
    }

    // Cushion row with L x W x T measurements (three inch values).
    const cushionDim = line.match(/(\d+\.\d+"\s*\d*mm?)/i);
    if (cushionDim && cushionDim.index != null && cushionDim.index > prefix.length) {
      const nums = parseTripleDims(line.slice(cushionDim.index));
      if (nums && nums.every((n) => n >= 3 && n <= 72)) {
        return { oem: line.slice(0, cushionDim.index).trim(), rest: line.slice(cushionDim.index) };
      }
    }

    // Description row: ...Seat back...
    const descIdx = line.search(/Seat back|Seat bottom|Seat single piece|Cushion set/i);
    if (descIdx > prefix.length) {
      return { oem: line.slice(0, descIdx).trim(), rest: line.slice(descIdx) };
    }

    // Simple part-number + models row.
    const spaced = line.match(
      new RegExp(`^(${prefix}[A-Z0-9./-]+?)\\s+([A-Z0-9].+)$`, 'i')
    );
    if (spaced) {
      return { oem: spaced[1].trim(), rest: spaced[2].trim() };
    }

    const compact = line.match(
      new RegExp(`^(${prefix}[A-Z0-9./-]+?)([A-Z][A-Z0-9].*)$`, 'i')
    );
    if (compact) {
      return { oem: compact[1].trim(), rest: compact[2].trim() };
    }
  }

  return null;
}
