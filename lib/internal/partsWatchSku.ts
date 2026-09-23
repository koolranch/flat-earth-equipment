/**
 * Catalog SKUs posted from the parts-watch dashboard.
 * Raymond and Crown numbers include a single internal space (`RA 590-726`, `CR 120091`).
 */
const SKU_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._\/ -]{0,63}$/;

export function isCatalogSku(value: string): boolean {
  const sku = value.trim();
  if (!sku || sku.length > 64) return false;
  if (/\s{2,}/.test(sku)) return false;
  return SKU_PATTERN.test(sku);
}
