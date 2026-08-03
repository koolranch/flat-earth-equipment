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
  amperage: 440 | 600 | 850;
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
    replaces: 'Curtis 1268 / 1520 (resistive throttle)',
    price: 899,
    amperage: 600,
  },
  {
    sku: 'NA600KIT',
    slug: 'navitas-ezgo-series-its-36-48v-600a-conversion-kit',
    name: 'Navitas E-Z-GO ITS 48V 600A Conversion Kit w/OTF',
    shortName: 'E-Z-GO ITS 600A',
    cartLabel: 'E-Z-GO ITS / PDS',
    replaces: 'Curtis 1268 / 1264 (ITS throttle)',
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
    replaces: 'Moric JW2 (G29 / Drive DC)',
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
    replaces: 'Curtis 1268 / 1520 (resistive throttle)',
    price: 719,
    amperage: 440,
  },
  {
    sku: '87-TSX3-440EZITS',
    slug: 'navitas-ezgo-its-48v-440a-conversion-kit',
    name: 'Navitas E-Z-GO ITS 48V 440A Conversion Kit w/OTF',
    shortName: 'E-Z-GO ITS 440A',
    cartLabel: 'E-Z-GO ITS / PDS',
    replaces: 'Curtis 1268 / 1264 (ITS throttle)',
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
    replaces: 'Moric JW2 (G29 / Drive DC)',
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
    replaces: 'Curtis 1268 / 1520 (resistive throttle)',
    good: NAVITAS_TSX_440A_KITS[1],
    better: NAVITAS_TSX_600A_KITS[1],
  },
  {
    id: 'ezgo-its',
    label: 'E-Z-GO ITS / PDS',
    replaces: 'Curtis 1268 / 1264 (ITS throttle)',
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
    replaces: 'Moric JW2 (G29 / Drive DC)',
    good: NAVITAS_TSX_440A_KITS[4],
    better: NAVITAS_TSX_600A_KITS[4],
  },
];

/**
 * OEM controller cheat-sheet for /navitas-controllers.
 * Source of truth: Navitas TSX3.0 harness list (40-0005xx) + FSIP kit titles.
 * Never key a recommendation on "Curtis 1268" alone — ITS vs resistive harnesses differ.
 */
export type NavitasOemGuideRow = {
  id: string;
  oemLabel: string;
  oemDetail: string;
  cartLabel: string;
  /** TSX keep-motor good/better when we stock that platform */
  tsx?: { goodSlug: string; betterSlug: string };
  /** Drive2-style AC controller (no motor swap) */
  tac2Slug?: string;
  /** Full DC→AC conversion with 7.5kW motor — only platforms we stock */
  tac3Slug?: string;
  confirmNote?: string;
};

export const NAVITAS_OEM_CONTROLLER_GUIDE: NavitasOemGuideRow[] = [
  {
    id: 'curtis-1206hb',
    oemLabel: 'Curtis 1206HB',
    oemDetail: '48V TXT shunt controller',
    cartLabel: 'E-Z-GO TXT 48V',
    tsx: {
      goodSlug: 'navitas-ezgo-txt-48v-440a-conversion-kit',
      betterSlug: 'navitas-ezgo-txt-48v-600a-conversion-kit',
    },
    tac3Slug: 'navitas-ezgo-txt-48v-850a-tac3-ac-conversion-kit',
    confirmNote: 'Not for TXT 36V (Curtis 1206MX) — we do not stock that kit.',
  },
  {
    id: 'curtis-1268-1264-its',
    oemLabel: 'Curtis 1268 + 1264',
    oemDetail: 'ITS throttle (Navitas harness 40-000516)',
    cartLabel: 'E-Z-GO ITS / PDS 48V',
    tsx: {
      goodSlug: 'navitas-ezgo-its-48v-440a-conversion-kit',
      betterSlug: 'navitas-ezgo-series-its-36-48v-600a-conversion-kit',
    },
    confirmNote: 'Must be the ITS pair. Do not order this if your second number is 1520.',
  },
  {
    id: 'curtis-1510-1515',
    oemLabel: 'Curtis 1510 / 1515',
    oemDetail: 'IQ / Excel shunt (Navitas harness 40-000542)',
    cartLabel: 'Club Car IQ / Excel (Precedent, Tempo, DS IQ)',
    tsx: {
      goodSlug: 'navitas-club-car-iq-excel-48v-440a-conversion-kit',
      betterSlug: 'navitas-club-car-iq-excel-48v-600a-conversion-kit',
    },
    tac3Slug: 'navitas-club-car-iq-excel-48v-850a-tac3-ac-conversion-kit',
  },
  {
    id: 'curtis-1268-1520',
    oemLabel: 'Curtis 1268 + 1520',
    oemDetail: 'Resistive throttle (Navitas harness 40-000515)',
    cartLabel: 'Club Car / StarEV (non-IQ 1268/1520)',
    tsx: {
      goodSlug: 'navitas-club-car-starev-48v-440a-conversion-kit',
      betterSlug: 'navitas-club-car-starev-48v-600a-conversion-kit',
    },
    confirmNote: 'Not the IQ/Excel kit. Confirm 1520 (or resistive 1268) — not 1264 ITS.',
  },
  {
    id: 'moric-jw2',
    oemLabel: 'Moric JW2',
    oemDetail: 'Yamaha G29 / Drive DC (Navitas harness 40-000513)',
    cartLabel: 'Yamaha G29 / Drive (2007–2016 DC)',
    tsx: {
      goodSlug: 'navitas-yamaha-g29-drive-48v-440a-conversion-kit',
      betterSlug: 'navitas-yamaha-g29-drive-48v-600a-conversion-kit',
    },
    tac3Slug: 'navitas-yamaha-g29-48v-850a-tac3-ac-conversion-kit',
    confirmNote: 'Not for Drive2 NEOS AC — see Toyota NEOS row below.',
  },
  {
    id: 'toyota-neos-m',
    oemLabel: 'Toyota NEOS “M”',
    oemDetail: 'Drive2 AC controls',
    cartLabel: 'Yamaha Drive2 / YDRE2 (NEOS AC)',
    tac2Slug: 'navitas-yamaha-drive2-neos-48v-440a-tac2-conversion-kit',
    confirmNote: 'TAC2 only on our shelf. Do not buy G29 TSX or G29 TAC3 850 for Drive2 NEOS.',
  },
];

/** Platforms we intentionally do not recommend from this hub (return-risk). */
export const NAVITAS_OEM_UNSUPPORTED: { label: string; reason: string }[] = [
  {
    label: 'Curtis 1206MX (EZGO TXT 36V)',
    reason: 'Different harness from 1206HB — we do not stock a 36V TXT kit.',
  },
  {
    label: 'Curtis 1268 alone (no second number)',
    reason: '1268 is shared by EZGO ITS (with 1264) and Club Car/StarEV (with 1520). Photo required.',
  },
  {
    label: 'EZGO RXV / other factory AC carts',
    reason: 'Not on this TSX/TAC shelf — email parts@ before ordering.',
  },
  {
    label: 'Yamaha G19 / G22',
    reason: 'Different Moric harness — not the G29/Drive kits listed here.',
  },
];

export const NAVITAS_OEM_WRONG_FIT_WARNINGS: string[] = [
  'TXT (1206HB) ≠ ITS (1268/1264) — different harnesses.',
  'Club Car IQ/Excel (1510/1515) ≠ Club Car/StarEV (1268/1520).',
  'Yamaha G29/Drive Moric DC ≠ Drive2 NEOS AC.',
  'TSX 440/600 keeps your DC motor; TAC3 850 replaces motor + controller.',
];

export const NAVITAS_ALL_TSX_KITS: NavitasKit[] = [
  ...NAVITAS_TSX_440A_KITS,
  ...NAVITAS_TSX_600A_KITS,
];

/** AC kits (not part of the TSX good/better ladder). */
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

/** TAC3 850A + 7.5kW motor — performance DC→AC lane. */
export const NAVITAS_TAC3_850A_KITS: NavitasAcKit[] = [
  {
    sku: '222-48VCANTXTTAC33850-7',
    slug: 'navitas-ezgo-txt-48v-850a-tac3-ac-conversion-kit',
    name: 'Navitas EZGO TXT 48/72V 850A TAC3 AC Conversion Kit (7.5kW)',
    shortName: 'EZGO TXT TAC3 850A',
    cartLabel: 'E-Z-GO TXT 48V/72V (1206HB)',
    replaces: 'Curtis 1206HB DC system',
    price: 2399,
    amperage: 850,
    includesOtf: false,
    series: 'TAC3',
    note: 'Full AC conversion with 7.5kW motor. No OTF — Bluetooth app only. May need custom controller mounting.',
  },
  {
    sku: '222-48VCANCCTAC3850-7',
    slug: 'navitas-club-car-iq-excel-48v-850a-tac3-ac-conversion-kit',
    name: 'Navitas Club Car IQ/Excel 48/72V 850A TAC3 AC Conversion Kit (7.5kW)',
    shortName: 'Club Car IQ/Excel TAC3 850A',
    cartLabel: 'Club Car IQ/Excel (1510/1515)',
    replaces: 'Curtis 1510 / 1515 DC system',
    price: 2399,
    amperage: 850,
    includesOtf: false,
    series: 'TAC3',
    note: 'Full AC conversion with 7.5kW motor. No OTF — Bluetooth app only. May need custom controller mounting.',
  },
  {
    sku: '222-48VCANYAMTAC3850-7',
    slug: 'navitas-yamaha-g29-48v-850a-tac3-ac-conversion-kit',
    name: 'Navitas Yamaha G29/Drive 48/72V 850A TAC3 AC Conversion Kit (7.5kW)',
    shortName: 'Yamaha G29 TAC3 850A',
    cartLabel: 'Yamaha G29 / Drive (Moric DC)',
    replaces: 'Moric DC motor + controller',
    price: 2399,
    amperage: 850,
    includesOtf: false,
    series: 'TAC3',
    note: 'Full AC conversion with 7.5kW motor. Not for Drive2 NEOS — use the TAC2 kit. No OTF — Bluetooth app only.',
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
    NAVITAS_TAC2_KITS.find((k) => k.slug === slug) ||
    NAVITAS_TAC3_850A_KITS.find((k) => k.slug === slug)
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
export const NAVITAS_TAC3_KIT_IMAGE =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/navitas-tac3-850a-conversion-kit.png';
