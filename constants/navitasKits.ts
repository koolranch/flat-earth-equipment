/**
 * Navitas TSX3.0 conversion kits (FSIP) — hub + lithium cross-sell map.
 */

export type NavitasKit = {
  sku: string;
  slug: string;
  name: string;
  shortName: string;
  cartLabel: string;
  replaces: string;
  price: number;
  amperage: 440 | 600;
};

/** Live Buy Now shelf — keep in sync with add-navitas-tsx-*-kits.ts scripts */
export const NAVITAS_TSX_600A_KITS: NavitasKit[] = [
  {
    sku: '87-TSX3-600CCIQX',
    slug: 'navitas-club-car-iq-excel-48v-600a-conversion-kit',
    name: 'Navitas Club Car IQ/Excel 48V 600A Conversion Kit w/OTF',
    shortName: 'Club Car IQ/Excel 600A',
    cartLabel: 'Club Car Precedent, Tempo, DS IQ, Excel',
    replaces: 'Curtis 1510 / 1515',
    price: 899,
    amperage: 600,
  },
  {
    sku: '87-TSX3-600CCSTR',
    slug: 'navitas-club-car-starev-48v-600a-conversion-kit',
    name: 'Navitas Club Car/StarEV 48V 600A Conversion Kit w/OTF',
    shortName: 'Club Car / StarEV 600A',
    cartLabel: 'Club Car / StarEV (1268/1520)',
    replaces: 'Curtis 1268 / 1520',
    price: 899,
    amperage: 600,
  },
  {
    sku: 'NA600KIT',
    slug: 'navitas-ezgo-series-its-36-48v-600a-conversion-kit',
    name: 'Navitas E-Z-GO ITS 48V 600A Conversion Kit w/OTF',
    shortName: 'E-Z-GO ITS 600A',
    cartLabel: 'E-Z-GO ITS / PDS',
    replaces: 'Curtis 1268 / 1264',
    price: 899,
    amperage: 600,
  },
  {
    sku: '87-TSX3-600EZTXT',
    slug: 'navitas-ezgo-txt-48v-600a-conversion-kit',
    name: 'Navitas E-Z-GO TXT 48V 600A Conversion Kit w/OTF',
    shortName: 'E-Z-GO TXT 600A',
    cartLabel: 'E-Z-GO TXT 48V',
    replaces: 'Curtis 1206HB',
    price: 899,
    amperage: 600,
  },
  {
    sku: '87-TSX3-600YG29',
    slug: 'navitas-yamaha-g29-drive-48v-600a-conversion-kit',
    name: 'Navitas Yamaha G29/Drive 48V 600A Conversion Kit w/OTF',
    shortName: 'Yamaha G29 / Drive 600A',
    cartLabel: 'Yamaha G29 / Drive 48V',
    replaces: 'Stock G29 / Drive controller',
    price: 899,
    amperage: 600,
  },
];

export const NAVITAS_TSX_440A_KITS: NavitasKit[] = [
  {
    sku: '87-TSX3-440CCIQX',
    slug: 'navitas-club-car-iq-excel-48v-440a-conversion-kit',
    name: 'Navitas Club Car IQ/Excel 48V 440A Conversion Kit w/OTF',
    shortName: 'Club Car IQ/Excel 440A',
    cartLabel: 'Club Car Precedent, Tempo, DS IQ, Excel',
    replaces: 'Curtis 1510 / 1515',
    price: 719,
    amperage: 440,
  },
  {
    sku: '87-TSX3-440CCSTR',
    slug: 'navitas-club-car-starev-48v-440a-conversion-kit',
    name: 'Navitas Club Car/StarEV 48V 440A Conversion Kit w/OTF',
    shortName: 'Club Car / StarEV 440A',
    cartLabel: 'Club Car / StarEV (1268/1520)',
    replaces: 'Curtis 1268 / 1520',
    price: 719,
    amperage: 440,
  },
  {
    sku: '87-TSX3-440EZITS',
    slug: 'navitas-ezgo-its-48v-440a-conversion-kit',
    name: 'Navitas E-Z-GO ITS 48V 440A Conversion Kit w/OTF',
    shortName: 'E-Z-GO ITS 440A',
    cartLabel: 'E-Z-GO ITS / PDS',
    replaces: 'Curtis 1268 / 1264',
    price: 719,
    amperage: 440,
  },
  {
    sku: '87-TSX3-440EZTXT',
    slug: 'navitas-ezgo-txt-48v-440a-conversion-kit',
    name: 'Navitas E-Z-GO TXT 48V 440A Conversion Kit w/OTF',
    shortName: 'E-Z-GO TXT 440A',
    cartLabel: 'E-Z-GO TXT 48V',
    replaces: 'Curtis 1206HB',
    price: 719,
    amperage: 440,
  },
  {
    sku: '87-TSX3-440YG29',
    slug: 'navitas-yamaha-g29-drive-48v-440a-conversion-kit',
    name: 'Navitas Yamaha G29/Drive 48V 440A Conversion Kit w/OTF',
    shortName: 'Yamaha G29 / Drive 440A',
    cartLabel: 'Yamaha G29 / Drive 48V',
    replaces: 'Stock G29 / Drive controller',
    price: 719,
    amperage: 440,
  },
];

/** Platform pairs for hub good/better cards (440A + 600A). */
export type NavitasPlatformPair = {
  id: string;
  label: string;
  replaces: string;
  good: NavitasKit;
  better: NavitasKit;
};

export const NAVITAS_PLATFORM_PAIRS: NavitasPlatformPair[] = [
  {
    id: 'club-car-iq-excel',
    label: 'Club Car IQ / Excel',
    replaces: 'Curtis 1510 / 1515',
    good: NAVITAS_TSX_440A_KITS[0],
    better: NAVITAS_TSX_600A_KITS[0],
  },
  {
    id: 'club-car-starev',
    label: 'Club Car / StarEV',
    replaces: 'Curtis 1268 / 1520',
    good: NAVITAS_TSX_440A_KITS[1],
    better: NAVITAS_TSX_600A_KITS[1],
  },
  {
    id: 'ezgo-its',
    label: 'E-Z-GO ITS / PDS',
    replaces: 'Curtis 1268 / 1264',
    good: NAVITAS_TSX_440A_KITS[2],
    better: NAVITAS_TSX_600A_KITS[2],
  },
  {
    id: 'ezgo-txt',
    label: 'E-Z-GO TXT',
    replaces: 'Curtis 1206HB',
    good: NAVITAS_TSX_440A_KITS[3],
    better: NAVITAS_TSX_600A_KITS[3],
  },
  {
    id: 'yamaha-g29',
    label: 'Yamaha G29 / Drive',
    replaces: 'Stock G29 / Drive controller',
    good: NAVITAS_TSX_440A_KITS[4],
    better: NAVITAS_TSX_600A_KITS[4],
  },
];

export const NAVITAS_ALL_TSX_KITS: NavitasKit[] = [
  ...NAVITAS_TSX_440A_KITS,
  ...NAVITAS_TSX_600A_KITS,
];

/** AC / NEOS kits (not part of the TSX good/better ladder). */
export type NavitasAcKit = NavitasKit & {
  includesOtf: boolean;
  series: 'TAC2' | 'TAC3';
  note: string;
};

export const NAVITAS_TAC2_KITS: NavitasAcKit[] = [
  {
    sku: '64-NAVYAMTAC2-G29-4',
    slug: 'navitas-yamaha-drive2-neos-48v-440a-tac2-conversion-kit',
    name: 'Navitas Yamaha Drive2 (NEOS) 48V 440A TAC2 Conversion Kit',
    shortName: 'Yamaha Drive2 TAC2 440A',
    cartLabel: 'Yamaha Drive2 / YDRE2 (NEOS AC)',
    replaces: 'Toyota NEOS M-type',
    price: 899,
    amperage: 440,
    includesOtf: false,
    series: 'TAC2',
    note: 'Does not include On-The-Fly programmer — tune via Bluetooth app.',
  },
];

/** Lithium cart landing slug → primary Navitas kit slug (600A preferred). */
export const LITHIUM_CART_NAVITAS_KIT: Record<string, string> = {
  'ezgo-txt-48v': 'navitas-ezgo-txt-48v-600a-conversion-kit',
  'club-car-precedent-48v': 'navitas-club-car-iq-excel-48v-600a-conversion-kit',
  'club-car-tempo-48v': 'navitas-club-car-iq-excel-48v-600a-conversion-kit',
  'club-car-ds-48v': 'navitas-club-car-iq-excel-48v-600a-conversion-kit',
  'yamaha-drive-48v': 'navitas-yamaha-g29-drive-48v-600a-conversion-kit',
  'yamaha-drive2-48v': 'navitas-yamaha-drive2-neos-48v-440a-tac2-conversion-kit',
};

export function getNavitasKitBySlug(slug: string): NavitasKit | undefined {
  return (
    NAVITAS_ALL_TSX_KITS.find((k) => k.slug === slug) ||
    NAVITAS_TAC2_KITS.find((k) => k.slug === slug)
  );
}

export function getNavitasKitForLithiumCart(cartSlug: string): NavitasKit | undefined {
  const kitSlug = LITHIUM_CART_NAVITAS_KIT[cartSlug];
  if (!kitSlug) return undefined;
  return getNavitasKitBySlug(kitSlug);
}

export const NAVITAS_HUB_PATH = '/navitas-controllers';
export const NAVITAS_KIT_IMAGE =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/navitas-tsx-600a-conversion-kit.png';
export const NAVITAS_440A_KIT_IMAGE =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/navitas-tsx-440a-conversion-kit.png';
