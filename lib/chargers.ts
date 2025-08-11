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


