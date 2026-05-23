import type { EquipmentModelIndexEntry, ParsedSeatRow, SeatProductRecord } from './types';
import { brandSlug } from './brandConfig';

export function normalizeOemSku(oem: string, productType?: import('./types').SeatProductType): string {
  const base = oem.toUpperCase().trim().replace(/\s+/g, '');
  if (productType && productType !== 'assembly') {
    const suffix =
      productType === 'cushion_back'
        ? '-BACK'
        : productType === 'cushion_bottom'
          ? '-BOTTOM'
          : productType === 'cushion_set'
            ? '-SET'
            : productType === 'cushion_single'
              ? '-SINGLE'
              : `-${productType.toUpperCase()}`;
    return `${base}${suffix}`;
  }
  return base;
}

export function isValidOemPartNumber(oem: string): boolean {
  const trimmed = oem.trim();
  if (trimmed.length < 5) return false;
  if (!/\d/.test(trimmed)) return false;
  if (/^(ADV|COL|LUL|TAYLOR)$/i.test(trimmed)) return false;
  if (/^(Advance|Bobcat|Columbia|Tennant|Caterpilliar|Genie|Manitou)\d+$/i.test(trimmed)) return false;
  return true;
}

function oemDedupeKey(oem: string): string {
  return oem.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export { oemDedupeKey };

function productTypeSlug(type: ParsedSeatRow['product_type']): string {
  switch (type) {
    case 'assembly':
      return 'seat-assembly';
    case 'cushion_back':
      return 'seat-back-cushion';
    case 'cushion_bottom':
      return 'seat-bottom-cushion';
    case 'cushion_set':
      return 'seat-cushion-set';
    case 'cushion_single':
      return 'seat-cushion';
    default:
      return 'seat-part';
  }
}

function productTypeLabel(type: ParsedSeatRow['product_type']): string {
  switch (type) {
    case 'assembly':
      return 'Seat Assembly';
    case 'cushion_back':
      return 'Seat Back Cushion';
    case 'cushion_bottom':
      return 'Seat Bottom Cushion';
    case 'cushion_set':
      return 'Seat Cushion Set';
    case 'cushion_single':
      return 'Seat Cushion';
    default:
      return 'Seat Component';
  }
}

function formatModelList(models: string[], max = 8): string {
  const top = models.slice(0, max);
  const suffix = models.length > max ? ` and ${models.length - max} more` : '';
  return top.join(', ') + suffix;
}

export function buildSeatSlug(row: ParsedSeatRow): string {
  const b = brandSlug(row.brand);
  const pn = row.oem_part_number
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${b}-${pn}-${productTypeSlug(row.product_type)}`;
}

export function buildSeatName(row: ParsedSeatRow): string {
  return `${row.brand} ${row.oem_part_number} ${productTypeLabel(row.product_type)}`;
}

export function buildSeatDescription(row: ParsedSeatRow): string {
  const typeLabel = productTypeLabel(row.product_type).toLowerCase();
  const models = formatModelList(row.compatible_models);
  const lines: string[] = [];

  lines.push(
    `Aftermarket ${typeLabel} for ${row.brand} industrial equipment. Replaces OEM part number ${row.oem_part_number}. Verified fitment for ${row.compatible_models.length} machine model${row.compatible_models.length === 1 ? '' : 's'} including ${models}.`
  );

  if (row.dimensions?.h_in && row.dimensions.w_in && row.dimensions.d_in) {
    lines.push(
      `Overall seat dimensions: ${row.dimensions.h_in}" H × ${row.dimensions.w_in}" W × ${row.dimensions.d_in}" D.`
    );
  } else if (row.dimensions?.length_in) {
    lines.push(
      `Cushion dimensions: ${row.dimensions.length_in}" L × ${row.dimensions.width_in}" W × ${row.dimensions.thickness_in}" thick.`
    );
  }

  if (row.material) {
    lines.push(`Upholstery: ${row.material}.`);
  }

  if (row.product_type === 'assembly') {
    const features: string[] = [];
    if (row.has_seat_adjusters) features.push('seat adjusters');
    if (row.has_seat_switch) features.push('seat switch / safety interlock');
    if (features.length) {
      lines.push(`Includes ${features.join(' and ')}.`);
    }
    if (row.replacement_back_cushion || row.replacement_bottom_cushion) {
      const refs = [row.replacement_back_cushion, row.replacement_bottom_cushion]
        .filter(Boolean)
        .join(' / ');
      lines.push(
        `Replacement cushion cross-references: ${refs}. Contact us if you need cushions only instead of a full assembly.`
      );
    }
  }

  lines.push(
    'Confirm your machine model and serial number before ordering — seat rails and switch wiring can vary by production year. Request a quote for availability and freight to your location.'
  );

  return lines.join('\n\n');
}

export function toSeatProductRecord(row: ParsedSeatRow): SeatProductRecord {
  const category = row.product_type === 'assembly' ? 'Seats' : 'Seat cushions';
  const category_slug = category === 'Seats' ? 'seats' : 'seat-cushions';

  const related: string[] = [];
  if (row.replacement_back_cushion) related.push(row.replacement_back_cushion);
  if (row.replacement_bottom_cushion) related.push(row.replacement_bottom_cushion);

  return {
    ...row,
    sku: normalizeOemSku(row.oem_part_number, row.product_type),
    slug: buildSeatSlug(row),
    name: buildSeatName(row),
    category,
    category_slug,
    description: buildSeatDescription(row),
    related_oem_parts: related,
  };
}

export function buildEquipmentModelIndex(products: SeatProductRecord[]): EquipmentModelIndexEntry[] {
  const index = new Map<string, EquipmentModelIndexEntry>();

  for (const p of products) {
    for (const model of p.compatible_models) {
      const key = `${p.brand}::${model}`;
      const slug = `${brandSlug(p.brand)}-${model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const existing = index.get(key) ?? {
        brand: p.brand,
        model,
        slug,
        assembly_oem_parts: [],
        cushion_oem_parts: [],
      };

      if (p.product_type === 'assembly') {
        if (!existing.assembly_oem_parts.includes(p.oem_part_number)) {
          existing.assembly_oem_parts.push(p.oem_part_number);
        }
      } else if (!existing.cushion_oem_parts.includes(p.oem_part_number)) {
        existing.cushion_oem_parts.push(p.oem_part_number);
      }

      index.set(key, existing);
    }
  }

  return [...index.values()].sort(
    (a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)
  );
}

export function buildSeatFamilies(products: SeatProductRecord[]) {
  const families = new Map<string, { back?: string; bottom?: string; assemblies: string[] }>();

  for (const p of products) {
    if (p.product_type !== 'assembly') continue;
    const back = p.replacement_back_cushion;
    const bottom = p.replacement_bottom_cushion;
    if (!back && !bottom) continue;

    const familyId = [back ?? '', bottom ?? ''].join('|');
    const existing = families.get(familyId) ?? { back, bottom, assemblies: [] };
    if (!existing.assemblies.includes(p.oem_part_number)) {
      existing.assemblies.push(p.oem_part_number);
    }
    families.set(familyId, existing);
  }

  return [...families.entries()].map(([family_id, data]) => ({ family_id, ...data }));
}
