const CUSTOMER_BRAND_ALIASES: Record<string, string> = {
  fsip: 'Flat Earth Equipment',
};

export function getDisplayBrand(brand?: string | null): string {
  if (!brand?.trim()) return 'Flat Earth Equipment';
  return CUSTOMER_BRAND_ALIASES[brand.trim().toLowerCase()] ?? brand.trim();
}

export function sanitizeCustomerFacingCopy(text?: string | null): string {
  if (!text) return '';

  return text
    .replace(/\s*GREEN Series by FSIP\.?/gi, '.')
    .replace(/\bby FSIP\b/gi, 'by Flat Earth Equipment')
    .replace(/\bFSIP\b/gi, 'Flat Earth Equipment')
    .replace(/\.\./g, '.')
    .trim();
}

export function isInternalBrand(brand?: string | null): boolean {
  return brand?.trim().toLowerCase() === 'fsip';
}
