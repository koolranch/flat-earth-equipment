const STORAGE_BASE =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos';

/** Files that exist in the public `brand-logos` bucket. */
const BRAND_LOGO_FILES: Record<string, string> = {
  bobcat: 'bobcat.webp',
  case: 'case-construction.webp',
  'case construction': 'case-construction.webp',
  'case-construction': 'case-construction.webp',
  caterpillar: 'caterpillar.webp',
  cat: 'caterpillar.webp',
  clark: 'clark.webp',
  crown: 'crown.webp',
  doosan: 'doosan.webp',
  enersys: 'enersys.png',
  'ep equipment': 'ep-equipment.webp',
  'ep-equipment': 'ep-equipment.webp',
  factorycat: 'factorycat.webp',
  'factory cat': 'factorycat.webp',
  'factory-cat': 'factorycat.webp',
  gehl: 'gehl.webp',
  genie: 'genie.webp',
  hangcha: 'hangcha.webp',
  heli: 'heli.webp',
  hyster: 'hyster.webp',
  hyundai: 'hyundai.webp',
  jcb: 'jcb.webp',
  jlg: 'jlg.webp',
  'john deere': 'john-deere.webp',
  'john-deere': 'john-deere.webp',
  karcher: 'karcher.webp',
  kärcher: 'karcher.webp',
  komatsu: 'komatsu.webp',
  kubota: 'kubota.webp',
  lcmg: 'lcmg.webp',
  linde: 'linde.webp',
  'lithium rhino': 'lithium-rhino.webp',
  liugong: 'liugong.png',
  lull: 'lull.webp',
  mec: 'mec.webp',
  mitsubishi: 'mitsubishi.webp',
  moffett: 'moffett.webp',
  nissan: 'nissan.webp',
  powerboss: 'powerboss.webp',
  raymond: 'raymond.webp',
  skyjack: 'skyjack.webp',
  skytrak: 'skytrak.webp',
  snorkel: 'snorkel.webp',
  tailift: 'tailift.webp',
  tcm: 'tcm.webp',
  tennant: 'tennant.webp',
  toro: 'toro.webp',
  toyota: 'toyota.webp',
  unicarriers: 'unicarriers.webp',
  xcmg: 'xcmg.webp',
  yale: 'yale.webp',
};

const KNOWN_LOGO_FILES = new Set(Object.values(BRAND_LOGO_FILES));

function normalizeBrandKey(brand: string): string {
  return brand.toLowerCase().trim().replace(/\s+/g, ' ');
}

function logoFileForBrand(brand: string): string | null {
  const key = normalizeBrandKey(brand);
  if (BRAND_LOGO_FILES[key]) return BRAND_LOGO_FILES[key];

  const slug = key.replace(/[\s_]+/g, '-');
  if (BRAND_LOGO_FILES[slug]) return BRAND_LOGO_FILES[slug];

  return null;
}

function isKnownLogoUrl(url: string): boolean {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop();
    return Boolean(filename && KNOWN_LOGO_FILES.has(filename));
  } catch {
    return false;
  }
}

export function getBrandLogoUrl(
  brand: string,
  brandLogoUrl?: string | null,
): string | null {
  const mappedFile = logoFileForBrand(brand);
  if (mappedFile) {
    return `${STORAGE_BASE}/${mappedFile}`;
  }

  if (brandLogoUrl?.trim() && isKnownLogoUrl(brandLogoUrl.trim())) {
    return brandLogoUrl.trim();
  }

  return null;
}

export function getBrandMonogram(brand: string): string {
  const cleaned = brand.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  if (!cleaned) return '?';

  const words = cleaned.split(/\s+/);
  if (words.length >= 2) {
    return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
  }

  return cleaned.slice(0, 2).toUpperCase();
}
