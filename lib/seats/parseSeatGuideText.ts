import type { ParsedSeatRow, SeatProductType, SeatSection } from './types';
import { inferBrandFromOem, normalizeBrand, splitOemFromLine } from './brandConfig';
import { isValidOemPartNumber, oemDedupeKey } from './buildSeatProduct';

const SKIP_LINE =
  /^(GUÍA|GUIDE|INDUSTRIAL|EQUIPMENT|SEATS|QUICK|REFERENCE|KEEPS|TABLE|CONTENTS|\d+$|SEAT ASSEMBLIES|REPLACEMENT CUSHIONS|H x W x D|Material|M1|M2|Seat Adjusters|Seat Switch|Replacement|Back Cushion|Bottom Cushion|Bottom|Cushion|Models|Description|Length|Width|Thickness|Type|WWW\.|SYPNIPASEAT|UNITED STATES|NOTES|Olathe|Latin America|CANADA|MEXICO|BRAZIL|BELGIUM)/i;

const BRAND_LINE = /^([A-Z][A-Z\s-]+)$/;

function splitModels(raw: string): string[] {
  return raw
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean)
    .filter((m) => !/^No$/i.test(m) && !/^SY\d+$/i.test(m));
}

function parseDimensionsTriple(text: string): ParsedSeatRow['dimensions'] | undefined {
  const m = text.match(
    /(\d+\.\d+)"\s*x\s*(\d+\.\d+)"\s*x\s*(\d+\.\d+)"/i
  );
  if (!m) return undefined;
  return {
    h_in: parseFloat(m[1]),
    w_in: parseFloat(m[2]),
    d_in: parseFloat(m[3]),
  };
}

function parseCushionDimensions(text: string): ParsedSeatRow['dimensions'] | undefined {
  const nums = [...text.matchAll(/(\d+\.\d+)"/g)].map((x) => parseFloat(x[1]));
  if (nums.length < 3) return undefined;
  return {
    length_in: nums[0],
    width_in: nums[1],
    thickness_in: nums[2],
  };
}

function mapCushionDescription(desc: string): SeatProductType {
  const d = desc.toLowerCase();
  if (d.includes('cushion set')) return 'cushion_set';
  if (d.includes('single piece')) return 'cushion_single';
  if (d.includes('seat back') || d === 'back') return 'cushion_back';
  if (d.includes('seat bottom') || d === 'bottom') return 'cushion_bottom';
  return 'cushion_back';
}

function parseAssemblySpecLine(
  oem: string,
  tail: string,
  section: SeatSection
): ParsedSeatRow | null {
  const dims = parseDimensionsTriple(tail);
  if (!dims) return null;

  const afterDims = tail.replace(/\d+\.\d+"\s*x\s*\d+\.\d+"\s*x\s*\d+\.\d+"/i, '');
  const material = afterDims.includes('Fabric')
    ? 'Fabric'
    : afterDims.includes('Vinyl')
      ? 'Vinyl'
      : undefined;

  const yesNo = [...afterDims.matchAll(/(Yes|No)/gi)].map((m) => m[1].toLowerCase() === 'yes');
  const has_seat_adjusters = yesNo[0];
  const has_seat_switch = yesNo[1];

  const syCodes = [...afterDims.matchAll(/SY\d+/g)].map((m) => m[0]);
  const replacement_back_cushion = syCodes[0];
  const replacement_bottom_cushion = syCodes[1];

  let modelsRaw = afterDims
    .replace(/Vinyl|Fabric/gi, '')
    .replace(/\d+\.?\d*"/g, '')
    .replace(/\b(Yes|No)\b/gi, '')
    .replace(/SY\d+/g, '')
    .trim();

  const modelStart = modelsRaw.search(/[A-Z][A-Z0-9][A-Z0-9\s./-]/);
  if (modelStart > 0) modelsRaw = modelsRaw.slice(modelStart);

  const compatible_models = splitModels(modelsRaw);
  if (compatible_models.length === 0) return null;

  return {
    oem_part_number: oem,
    brand: inferBrandFromOem(oem),
    section,
    product_type: 'assembly',
    compatible_models,
    dimensions: dims,
    material,
    has_seat_adjusters,
    has_seat_switch,
    replacement_back_cushion,
    replacement_bottom_cushion,
  };
}

function parseSimplePartLine(
  oem: string,
  modelsRaw: string,
  section: SeatSection
): ParsedSeatRow | null {
  if (/^Seat (back|bottom|single piece)|^Cushion set$/i.test(modelsRaw)) return null;
  if (/^\d+\.\d+"/.test(modelsRaw)) return null;

  const compatible_models = splitModels(modelsRaw);
  if (compatible_models.length === 0) return null;

  return {
    oem_part_number: oem,
    brand: inferBrandFromOem(oem),
    section,
    product_type: section === 'assemblies' ? 'assembly' : 'cushion_back',
    compatible_models,
  };
}

function parseCushionDescriptionLine(oem: string, rest: string): ParsedSeatRow | null {
  const m = rest.match(/^(Seat back|Seat bottom|Seat single piece|Cushion set)(.+)$/i);
  if (!m) return null;

  const product_type = mapCushionDescription(m[1]);
  const compatible_models = splitModels(m[2]);
  if (compatible_models.length === 0) return null;

  return {
    oem_part_number: oem,
    brand: inferBrandFromOem(oem),
    section: 'cushions',
    product_type,
    compatible_models,
    cushion_description: m[1],
  };
}

function parseCushionDimensionLine(oem: string, tail: string): ParsedSeatRow | null {
  const dims = parseCushionDimensions(tail);
  if (!dims) return null;

  const typeMatch = tail.match(/\b(Back|Bottom)\b/i);
  const material = tail.includes('Fabric') ? 'Fabric' : tail.includes('Vinyl') ? 'Vinyl' : undefined;
  const product_type: SeatProductType =
    typeMatch?.[1].toLowerCase() === 'bottom' ? 'cushion_bottom' : 'cushion_back';

  const afterType = tail.split(/Back|Bottom/i).pop() ?? '';
  const modelsRaw = afterType
    .replace(/Vinyl|Fabric|\d+\.?\d*"/g, '')
    .replace(/\d+mm/g, '')
    .trim();
  const compatible_models = splitModels(modelsRaw);
  if (compatible_models.length === 0) return null;

  return {
    oem_part_number: oem,
    brand: inferBrandFromOem(oem),
    section: 'cushions',
    product_type,
    compatible_models,
    dimensions: dims,
    material,
  };
}

function mergeRow(existing: ParsedSeatRow, incoming: ParsedSeatRow): ParsedSeatRow {
  const models = new Set([...existing.compatible_models, ...incoming.compatible_models]);
  return {
    ...existing,
    ...incoming,
    brand: inferBrandFromOem(incoming.oem_part_number, existing.brand),
    compatible_models: [...models].sort(),
    dimensions: existing.dimensions ?? incoming.dimensions,
    material: existing.material ?? incoming.material,
    has_seat_adjusters: existing.has_seat_adjusters ?? incoming.has_seat_adjusters,
    has_seat_switch: existing.has_seat_switch ?? incoming.has_seat_switch,
    replacement_back_cushion:
      existing.replacement_back_cushion ?? incoming.replacement_back_cushion,
    replacement_bottom_cushion:
      existing.replacement_bottom_cushion ?? incoming.replacement_bottom_cushion,
  };
}

export function parseSeatGuideText(text: string): ParsedSeatRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let section: SeatSection = 'assemblies';
  const byKey = new Map<string, ParsedSeatRow>();

  for (const line of lines) {
    if (/^REPLACEMENT CUSHIONS/i.test(line)) {
      section = 'cushions';
      continue;
    }
    if (/^SEAT ASSEMBLIES/i.test(line)) {
      section = 'assemblies';
      continue;
    }

    if (SKIP_LINE.test(line)) continue;

    if (BRAND_LINE.test(line)) {
      const normalized = normalizeBrand(line);
      if (normalized) continue;
      continue;
    }

    const split = splitOemFromLine(line);
    if (!split) continue;

    const { oem, rest } = split;
    if (/^SY\d/i.test(oem)) continue;

    const attempts: Array<ParsedSeatRow | null> = [
      parseAssemblySpecLine(oem, rest, section),
      parseCushionDescriptionLine(oem, rest),
      parseCushionDimensionLine(oem, rest),
      parseSimplePartLine(oem, rest, section),
    ];

    const row = attempts.find(Boolean);
    if (!row) continue;
    if (!isValidOemPartNumber(row.oem_part_number)) continue;

    const key = `${row.brand}::${oemDedupeKey(row.oem_part_number)}::${row.product_type}`;
    const existing = byKey.get(key);
    if (existing) {
      const merged = mergeRow(existing, row);
      // Prefer OEM formatting that includes / or - separators when merging slash variants.
      if (row.oem_part_number.includes('/') || row.oem_part_number.includes('-')) {
        merged.oem_part_number = row.oem_part_number;
      }
      byKey.set(key, merged);
    } else {
      byKey.set(key, row);
    }
  }

  return [...byKey.values()].sort((a, b) =>
    a.brand.localeCompare(b.brand) || a.oem_part_number.localeCompare(b.oem_part_number)
  );
}
