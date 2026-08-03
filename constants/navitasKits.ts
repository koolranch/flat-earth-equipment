/**
 * Navitas TSX3.0 Phase 1 conversion kits (FSIP) — hub + lithium cross-sell map.
 */

export type NavitasKit = {
  sku: string;
  slug: string;
  name: string;
  shortName: string;
  cartLabel: string;
  replaces: string;
  price: number;
};

/** Live Buy Now shelf — keep in sync with scripts/add-navitas-tsx-600a-kits.ts */
export const NAVITAS_TSX_600A_KITS: NavitasKit[] = [
  {
    sku: '87-TSX3-600CCIQX',
    slug: 'navitas-club-car-iq-excel-48v-600a-conversion-kit',
    name: 'Navitas Club Car IQ/Excel 48V 600A Conversion Kit w/OTF',
    shortName: 'Club Car IQ/Excel 600A',
    cartLabel: 'Club Car Precedent, Tempo, DS IQ, Excel',
    replaces: 'Curtis 1510 / 1515',
    price: 899,
  },
  {
    sku: '87-TSX3-600CCSTR',
    slug: 'navitas-club-car-starev-48v-600a-conversion-kit',
    name: 'Navitas Club Car/StarEV 48V 600A Conversion Kit w/OTF',
    shortName: 'Club Car / StarEV 600A',
    cartLabel: 'Club Car / StarEV (1268/1520)',
    replaces: 'Curtis 1268 / 1520',
    price: 899,
  },
  {
    sku: 'NA600KIT',
    slug: 'navitas-ezgo-series-its-36-48v-600a-conversion-kit',
    name: 'Navitas E-Z-GO ITS 48V 600A Conversion Kit w/OTF',
    shortName: 'E-Z-GO ITS 600A',
    cartLabel: 'E-Z-GO ITS / PDS',
    replaces: 'Curtis 1268 / 1264',
    price: 899,
  },
  {
    sku: '87-TSX3-600EZTXT',
    slug: 'navitas-ezgo-txt-48v-600a-conversion-kit',
    name: 'Navitas E-Z-GO TXT 48V 600A Conversion Kit w/OTF',
    shortName: 'E-Z-GO TXT 600A',
    cartLabel: 'E-Z-GO TXT 48V',
    replaces: 'Curtis 1206HB',
    price: 899,
  },
  {
    sku: '87-TSX3-600YG29',
    slug: 'navitas-yamaha-g29-drive-48v-600a-conversion-kit',
    name: 'Navitas Yamaha G29/Drive 48V 600A Conversion Kit w/OTF',
    shortName: 'Yamaha G29 / Drive 600A',
    cartLabel: 'Yamaha G29 / Drive 48V',
    replaces: 'Stock G29 / Drive controller',
    price: 899,
  },
];

/** Lithium cart landing slug → primary Navitas kit slug (when a clear TSX fit exists). */
export const LITHIUM_CART_NAVITAS_KIT: Record<string, string> = {
  'ezgo-txt-48v': 'navitas-ezgo-txt-48v-600a-conversion-kit',
  'club-car-precedent-48v': 'navitas-club-car-iq-excel-48v-600a-conversion-kit',
  'club-car-tempo-48v': 'navitas-club-car-iq-excel-48v-600a-conversion-kit',
  'club-car-ds-48v': 'navitas-club-car-iq-excel-48v-600a-conversion-kit',
  'yamaha-drive-48v': 'navitas-yamaha-g29-drive-48v-600a-conversion-kit',
};

export function getNavitasKitBySlug(slug: string): NavitasKit | undefined {
  return NAVITAS_TSX_600A_KITS.find((k) => k.slug === slug);
}

export function getNavitasKitForLithiumCart(cartSlug: string): NavitasKit | undefined {
  const kitSlug = LITHIUM_CART_NAVITAS_KIT[cartSlug];
  if (!kitSlug) return undefined;
  return getNavitasKitBySlug(kitSlug);
}

export const NAVITAS_HUB_PATH = '/navitas-controllers';
export const NAVITAS_KIT_IMAGE =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/navitas-tsx-600a-conversion-kit.png';
