/**
 * Lithium Rhino / golf-cart lithium SEO helpers for the managed revenue program.
 *
 * Money-keyword → winning URL map, plus PDP title builders so brand/Ah intent
 * lands on the correct kit page (not only the hub).
 *
 * See docs/projects/lithium-batteries-revenue/README.md
 */

export type LithiumMoneyKeyword = {
  keyword: string;
  /** Canonical path we want ranking (pathname only, leading slash). */
  targetUrl: string;
  /** Lane for STATUS reporting */
  lane: 'generic' | 'brand' | 'cart' | 'pn';
};

/** Priority money keywords for weekly DataForSEO rank checks. */
export const LITHIUM_MONEY_KEYWORDS: LithiumMoneyKeyword[] = [
  // Generic commercial (hub)
  { keyword: 'lithium golf cart battery', targetUrl: '/lithium-batteries', lane: 'generic' },
  { keyword: 'golf cart lithium battery', targetUrl: '/lithium-batteries', lane: 'generic' },
  { keyword: '48v lithium golf cart battery', targetUrl: '/lithium-batteries', lane: 'generic' },
  {
    keyword: 'lithium golf cart battery conversion kit',
    targetUrl: '/lithium-batteries',
    lane: 'generic',
  },
  {
    keyword: '48v lithium golf cart conversion kit',
    targetUrl: '/lithium-batteries',
    lane: 'generic',
  },
  { keyword: 'lifepo4 golf cart battery 48v', targetUrl: '/lithium-batteries', lane: 'generic' },
  {
    keyword: '48v 65ah lithium golf cart battery',
    targetUrl: '/parts/lithium-rhino-48v-65ah-kit',
    lane: 'generic',
  },

  // Brand (hub for broad; PDP for voltage/Ah)
  { keyword: 'lithium rhino', targetUrl: '/lithium-batteries', lane: 'brand' },
  { keyword: 'lithium rhino battery', targetUrl: '/lithium-batteries', lane: 'brand' },
  {
    keyword: 'lithium rhino golf cart battery',
    targetUrl: '/lithium-batteries',
    lane: 'brand',
  },
  {
    keyword: 'lithium rhino conversion kit',
    targetUrl: '/lithium-batteries',
    lane: 'brand',
  },
  { keyword: 'lithium rhino 48v', targetUrl: '/lithium-batteries', lane: 'brand' },
  {
    keyword: 'lithium rhino 48v 65ah',
    targetUrl: '/parts/lithium-rhino-48v-65ah-kit',
    lane: 'brand',
  },
  {
    keyword: 'lithium rhino 48v 65ah kit',
    targetUrl: '/parts/lithium-rhino-48v-65ah-kit',
    lane: 'brand',
  },
  {
    keyword: 'lithium rhino 48v 105ah',
    targetUrl: '/parts/lithium-rhino-48v-105ah-kit',
    lane: 'brand',
  },
  {
    keyword: 'lithium rhino 48v 50ah',
    targetUrl: '/parts/lithium-rhino-48v-50ah-kit',
    lane: 'brand',
  },
  {
    keyword: 'lithium rhino 36v',
    targetUrl: '/parts/lithium-rhino-36v-65ah-kit',
    lane: 'brand',
  },
  {
    keyword: 'lithium rhino 72v',
    targetUrl: '/parts/lithium-rhino-72v-105ah-kit',
    lane: 'brand',
  },

  // Cart / model
  {
    keyword: 'ezgo txt 48v lithium battery conversion',
    targetUrl: '/lithium-batteries/ezgo-txt-48v',
    lane: 'cart',
  },
  {
    keyword: 'ezgo rxv lithium battery',
    targetUrl: '/lithium-batteries/ezgo-rxv-48v',
    lane: 'cart',
  },
  {
    keyword: 'club car precedent lithium battery',
    targetUrl: '/lithium-batteries/club-car-precedent-48v',
    lane: 'cart',
  },
  {
    keyword: 'club car ds lithium battery',
    targetUrl: '/lithium-batteries/club-car-ds-48v',
    lane: 'cart',
  },
  {
    keyword: 'yamaha drive lithium battery',
    targetUrl: '/lithium-batteries/yamaha-drive-48v',
    lane: 'cart',
  },

  // FSIP PNs (long-tail; already ranking — protect)
  {
    keyword: '113-LR51V65AH',
    targetUrl: '/parts/lithium-rhino-48v-65ah-kit',
    lane: 'pn',
  },
  {
    keyword: '113-LR51V50AH',
    targetUrl: '/parts/lithium-rhino-48v-50ah-kit',
    lane: 'pn',
  },
  {
    keyword: '113-LR51V105AH',
    targetUrl: '/parts/lithium-rhino-48v-105ah-kit',
    lane: 'pn',
  },
];

/** Hub quick-picks for convert-phase brand SERP deep links. */
export const LITHIUM_HUB_FEATURED_KITS = [
  {
    slug: 'lithium-rhino-48v-65ah-kit',
    label: '48V 65Ah Kit',
    blurb: 'Best seller — budget conversion for modern 48V carts',
  },
  {
    slug: 'lithium-rhino-48v-105ah-kit',
    label: '48V 105Ah Kit',
    blurb: 'Most popular — everyday range for EZGO, Club Car, Yamaha',
  },
  {
    slug: 'lithium-rhino-48v-50ah-kit',
    label: '48V 50Ah Kit',
    blurb: 'Light-duty / short-course carts',
  },
  {
    slug: 'lithium-rhino-36v-65ah-kit',
    label: '36V 65Ah Kit',
    blurb: 'Older EZGO TXT / Club Car DS / Yamaha G-series',
  },
] as const;

type LithiumMetaInput = {
  name?: string | null;
  sku?: string | null;
  category?: string | null;
  metadata?: Record<string, unknown> | null;
};

function voltageCapacityLabel(meta: Record<string, unknown> | null | undefined): string | null {
  const voltage = typeof meta?.voltage === 'string' ? meta.voltage : null;
  const capacity = typeof meta?.capacity === 'string' ? meta.capacity : null;
  if (!voltage || !capacity) return null;
  return `${voltage} ${capacity}`;
}

/**
 * SERP title for Lithium Rhino PDPs — leads with brand + voltage/Ah + kit/battery.
 * Keeps under ~60 chars when possible.
 */
export function buildLithiumRhinoMetaTitle(product: LithiumMetaInput): string | null {
  if (product.category !== 'Lithium Batteries') return null;
  const meta = product.metadata ?? {};
  const vc = voltageCapacityLabel(meta);
  if (!vc) return null;

  const productType = meta.product_type === 'battery' ? 'Battery' : 'Conversion Kit';
  const variant =
    meta.variant === 'heated'
      ? ' Heated'
      : meta.variant === 'cube'
        ? ' Cube'
        : meta.variant === 'goliath'
          ? ' Goliath'
          : '';

  const primary = `Lithium Rhino ${vc}${variant} ${productType}`;
  if (primary.length <= 58) return primary;
  return `Lithium Rhino ${vc}${variant}`.slice(0, 58);
}

/**
 * Meta description lead for lithium PDPs — brand + kit/battery + warranty + carts.
 */
export function buildLithiumRhinoMetaDescription(product: LithiumMetaInput): string | null {
  if (product.category !== 'Lithium Batteries') return null;
  const meta = product.metadata ?? {};
  const vc = voltageCapacityLabel(meta) ?? 'LiFePO4';
  const productType =
    meta.product_type === 'battery'
      ? 'replacement battery'
      : 'conversion kit (battery, charger, DC converter, display, hardware)';
  const sku = product.sku ? ` SKU ${product.sku}.` : '';
  return `In-stock Lithium Rhino ${vc} LiFePO4 golf cart ${productType}. 6,000+ cycles, 8-year warranty, IP65. Fits EZGO, Club Car, Yamaha.${sku} HazMat ground shipping; free freight on 3+.`;
}

/** Cart landing paths that match a lithium SKU's voltage / compatible carts. */
export function lithiumCartPathsForProduct(product: {
  metadata?: Record<string, unknown> | null;
}): Array<{ href: string; label: string }> {
  const meta = product.metadata ?? {};
  const voltage = typeof meta.voltage === 'string' ? meta.voltage : null;
  const carts = Array.isArray(meta.compatible_carts)
    ? meta.compatible_carts.filter((c): c is string => typeof c === 'string')
    : [];

  const paths: Array<{ href: string; label: string }> = [];
  const push = (href: string, label: string) => {
    if (!paths.some((p) => p.href === href)) paths.push({ href, label });
  };

  for (const cart of carts) {
    const lower = cart.toLowerCase();
    if (lower.includes('ezgo txt') && voltage === '48V') {
      push('/lithium-batteries/ezgo-txt-48v', 'EZGO TXT 48V');
    } else if (lower.includes('ezgo txt') && voltage === '36V') {
      push('/lithium-batteries/ezgo-txt-36v', 'EZGO TXT 36V');
    } else if (lower.includes('ezgo rxv')) {
      push('/lithium-batteries/ezgo-rxv-48v', 'EZGO RXV 48V');
    } else if (lower.includes('precedent')) {
      push('/lithium-batteries/club-car-precedent-48v', 'Club Car Precedent');
    } else if (lower.includes('tempo')) {
      push('/lithium-batteries/club-car-tempo-48v', 'Club Car Tempo');
    } else if (lower.includes('club car ds') && voltage === '48V') {
      push('/lithium-batteries/club-car-ds-48v', 'Club Car DS 48V');
    } else if (lower.includes('yamaha drive2') || lower.includes('drive/drive2')) {
      push('/lithium-batteries/yamaha-drive2-48v', 'Yamaha Drive2');
    } else if (lower.includes('yamaha drive')) {
      push('/lithium-batteries/yamaha-drive-48v', 'Yamaha Drive');
    }
  }

  return paths.slice(0, 4);
}
