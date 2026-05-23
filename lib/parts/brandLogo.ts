const STORAGE_BASE =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos';

const BRAND_SLUGS: Record<string, string> = {
  'flat earth equipment': 'flat-earth',
  jcb: 'jcb',
  fsip: 'fsip',
  'lithium rhino': 'lithium-rhino',
  crown: 'crown',
  toyota: 'toyota',
  hyster: 'hyster',
  genie: 'genie',
  jlg: 'jlg',
  skyjack: 'skyjack',
  bobcat: 'bobcat',
  kubota: 'kubota',
  curtis: 'curtis',
  raymond: 'raymond',
  enersys: 'enersys',
  act: 'act',
};

export function getBrandLogoUrl(
  brand: string,
  brandLogoUrl?: string | null,
): string | null {
  if (brandLogoUrl?.trim()) return brandLogoUrl.trim();

  const slug = BRAND_SLUGS[brand.toLowerCase().trim()];
  if (!slug) return null;

  return `${STORAGE_BASE}/${slug}.webp`;
}
