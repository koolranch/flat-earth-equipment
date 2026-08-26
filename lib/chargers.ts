export type Part = {
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  image_url: string | null;
  price: string | null;
  price_cents: number | null;
  sku: string | null;
};

export type Specs = {
  family: "green2" | "green4" | "green6" | "green8" | "greenx" | "unknown";
  voltage: number | null;
  current: number | null;
  phase: "1P" | "3P" | "unknown";
};

const FAMILY_PHASE: Record<Specs["family"], Specs["phase"]> = {
  green2: "1P",
  green4: "1P",
  green6: "3P",
  green8: "3P",
  greenx: "3P",
  unknown: "unknown",
};

export function parseSpecsFromSlug(slug: string): Specs {
  const m = slug.match(/^(green[2468x])-(\d{2})v-(\d{2,3})a$/i);
  if (!m)
    return { family: "unknown", voltage: null, current: null, phase: "unknown" };
  const family = m[1]!.toLowerCase() as Specs["family"];
  const voltage = Number(m[2]!);
  const current = Number(m[3]!);
  const phase = FAMILY_PHASE[family] ?? "unknown";
  return { family, voltage, current, phase };
}

export function currency(price: string | number | null | undefined) {
  if (price === null || price === undefined || price === "" || Number(price) <= 0)
    return null;
  const n = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(n) || n <= 0) return null;
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function shortDesc(s: string | null, fallback: string): string {
  if (!s || !s.trim()) return fallback;
  return s.length > 180 ? s.slice(0, 177) + "..." : s;
}

export type CatalogChargerFields = {
  name?: string;
  sku?: string | null;
  images: string[] | null;
  fsip_price: number | null;
  your_price: number | null;
  stripe_price_id?: string | null;
  meta_description?: string | null;
};

export type PartsChargerOverlay = {
  name?: string | null;
  sku?: string | null;
  description?: string | null;
  image_url?: string | null;
  price?: string | null;
  price_cents?: number | null;
  stripe_price_id?: string | null;
};

function parsePartsDollars(part: PartsChargerOverlay): number | null {
  if (part.price_cents != null && part.price_cents > 0) return part.price_cents / 100;
  if (part.price) {
    const n = Number(part.price);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return null;
}

/**
 * `/chargers/[slug]` reads legacy `parts_catalog`, but the hub and Buy Now
 * SKUs live in `parts`. Fill missing catalog image / price / Stripe IDs
 * from the matching parts row without overwriting a complete catalog listing.
 */
export function overlayCatalogWithParts<T extends CatalogChargerFields>(
  catalog: T,
  part: PartsChargerOverlay | null | undefined
): T {
  if (!part) return catalog;

  const hasImage = Boolean(catalog.images && catalog.images.length > 0);
  const hasPrice =
    (catalog.your_price != null && catalog.your_price > 0) ||
    (catalog.fsip_price != null && catalog.fsip_price > 0);
  const hasStripe = Boolean(catalog.stripe_price_id);
  const partPrice = parsePartsDollars(part);

  return {
    ...catalog,
    images: hasImage ? catalog.images : part.image_url ? [part.image_url] : catalog.images,
    your_price: hasPrice ? catalog.your_price : partPrice ?? catalog.your_price,
    stripe_price_id: hasStripe ? catalog.stripe_price_id : part.stripe_price_id ?? catalog.stripe_price_id,
    meta_description: catalog.meta_description || part.description || catalog.meta_description,
    sku: catalog.sku || part.sku || catalog.sku,
    name: catalog.name || part.name || catalog.name,
  };
}

export function chargerSellPrice(p: Pick<CatalogChargerFields, "your_price" | "fsip_price">): number | null {
  if (p.your_price !== null && p.your_price > 0) return p.your_price;
  if (p.fsip_price !== null && p.fsip_price > 0) return p.fsip_price;
  return null;
}

/** Voltage×amp GREEN SKUs (green2-36v-45a). Series hubs are not this shape. */
export function isGreenVoltageAmpSlug(slug: string): boolean {
  return parseSpecsFromSlug(slug).family !== "unknown";
}

export const INDEXABLE_CHARGER_SERIES_SLUGS = [
  "green2-single-phase-battery-charger",
  "green4-single-phase-battery-charger",
  "green6-3-phase-battery-charger",
  "green8-3-phase-battery-charger",
  "greenx-3-phase-battery-charger",
] as const;

export function greenSeriesCanonicalPath(slug: string): string | null {
  const family = parseSpecsFromSlug(slug).family;
  switch (family) {
    case "green2":
      return "/chargers/green2-single-phase-battery-charger";
    case "green4":
      return "/chargers/green4-single-phase-battery-charger";
    case "green6":
      return "/chargers/green6-3-phase-battery-charger";
    case "green8":
      return "/chargers/green8-3-phase-battery-charger";
    case "greenx":
      return "/chargers/greenx-3-phase-battery-charger";
    case "unknown":
      return null;
    default: {
      const _exhaustive: never = family;
      return _exhaustive;
    }
  }
}

/**
 * GREEN voltage×amp PDPs stay noindex even after a parts overlay fills
 * image/price — they are near-duplicates of the series hub. Other charger
 * PDPs still noindex when both image and price are missing.
 */
export function chargerShouldNoIndex(
  slug: string,
  p: Pick<CatalogChargerFields, "images" | "your_price" | "fsip_price">
): boolean {
  if (isGreenVoltageAmpSlug(slug)) return true;
  const hasImage = Boolean(p.images && p.images.length > 0);
  const hasPrice = chargerSellPrice(p) != null;
  return !hasImage && !hasPrice;
}

export function chargerCanonicalPath(slug: string): string {
  return greenSeriesCanonicalPath(slug) ?? `/chargers/${slug}`;
}


