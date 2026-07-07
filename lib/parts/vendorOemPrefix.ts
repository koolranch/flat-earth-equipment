import { OEM_PREFIX_BRAND } from '@/lib/seats/brandConfig';

const BRAND_VENDOR_PREFIXES = Object.entries(OEM_PREFIX_BRAND).reduce<
  Record<string, string[]>
>((acc, [prefix, brand]) => {
  if (!acc[brand]) acc[brand] = [];
  acc[brand].push(prefix);
  return acc;
}, {});

for (const prefixes of Object.values(BRAND_VENDOR_PREFIXES)) {
  prefixes.sort((a, b) => b.length - a.length);
}

const SKU_SUFFIX_RE = /-(BACK|BOTTOM|SET|SINGLE)$/i;

function getPrefixesForBrand(brand?: string | null): string[] {
  if (!brand?.trim()) return [];
  return BRAND_VENDOR_PREFIXES[brand.trim()] ?? [];
}

export function stripVendorCatalogPrefix(
  partNumber: string,
  brand?: string | null,
): string {
  const trimmed = partNumber.trim();
  if (!trimmed) return trimmed;

  const prefixes = getPrefixesForBrand(brand);
  for (const prefix of prefixes) {
    const re = new RegExp(`^${prefix}`, 'i');
    if (re.test(trimmed)) {
      return trimmed.replace(re, '');
    }
  }

  return trimmed;
}

export function stripSkuSuffix(sku: string): string {
  return sku.replace(SKU_SUFFIX_RE, '');
}

export function getCustomerPartNumber(input: {
  brand?: string | null;
  sku?: string | null;
  oemReference?: string | null;
}): string {
  if (input.oemReference?.trim()) {
    return stripVendorCatalogPrefix(input.oemReference, input.brand);
  }

  if (input.sku?.trim()) {
    return stripVendorCatalogPrefix(stripSkuSuffix(input.sku), input.brand);
  }

  return '';
}

export function getCustomerProductName(
  name: string,
  brand?: string | null,
): string {
  const prefixes = getPrefixesForBrand(brand);
  if (!prefixes.length) return name;

  let result = name;
  for (const prefix of prefixes) {
    const re = new RegExp(`\\b${prefix}(?=[0-9./-])`, 'gi');
    result = result.replace(re, '');
  }

  return result.replace(/\s+/g, ' ').trim();
}

export function sanitizeCustomerFacingDescription(
  description: string,
  brand?: string | null,
): string {
  const prefixes = getPrefixesForBrand(brand);
  if (!prefixes.length) return description;

  let result = description;
  for (const prefix of prefixes) {
    const re = new RegExp(`\\b${prefix}(?=[0-9./-])`, 'gi');
    result = result.replace(re, '');
  }

  return result;
}

export function hasVendorCatalogPrefix(
  partNumber: string,
  brand?: string | null,
): boolean {
  const trimmed = partNumber.trim();
  if (!trimmed) return false;

  const prefixes = getPrefixesForBrand(brand);
  return prefixes.some((prefix) => new RegExp(`^${prefix}`, 'i').test(trimmed));
}

export function cleanVendorPrefixedMetadataValue(
  value: string,
  brand?: string | null,
): string {
  return stripVendorCatalogPrefix(value, brand);
}
