import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com';
const cdn = (process.env.NEXT_PUBLIC_SUPABASE_URL || '') + '/storage/v1/object/public/' + (process.env.NEXT_PUBLIC_ASSET_BUCKET || 'public-assets');

/**
 * Generate a canonical URL that strips query parameters.
 * This prevents index bloat from search/filter pages.
 * @param pathname - The pathname without query string (e.g., '/insights')
 * @returns Full canonical URL
 */
export function getCanonicalUrl(pathname: string): string {
  // Ensure pathname starts with /
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Generate proper alternates metadata with:
 * - Self-referencing canonical URL
 * - Self-referencing hreflang for en-US (primary locale)
 * - x-default hreflang pointing to current page
 * 
 * This fixes Ahrefs "Missing self-referencing hreflang" errors.
 * 
 * @param pathname - The pathname without query string (e.g., '/insights')
 * @returns Metadata alternates object with canonical and languages
 */
export function generatePageAlternates(pathname: string): Metadata['alternates'] {
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const fullUrl = `${SITE_URL}${cleanPath}`;
  
  return {
    canonical: cleanPath,
    languages: {
      'en-US': fullUrl,
      'x-default': fullUrl,
    },
  };
}

/**
 * Generate metadata with self-referencing canonical URL.
 * Always strips query parameters from the canonical.
 * @deprecated Use generatePageAlternates instead for proper hreflang support
 */
export function generateCanonicalMetadata(pathname: string): Pick<Metadata, 'alternates'> {
  return {
    alternates: generatePageAlternates(pathname),
  };
}

export const seoDefaults: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Forklift Certification — Flat Earth Equipment',
    template: '%s | Flat Earth Equipment'
  },
  description: 'Modern, interactive forklift operator training and certification — fast, compliant, and no BS.',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Forklift Certification — Flat Earth Equipment',
    description: 'Modern, interactive forklift operator training and certification — fast, compliant, and no BS.',
    images: [{ url: `${cdn}/images/generated/og-default.png`, width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forklift Certification — Flat Earth Equipment',
    description: 'Modern, interactive forklift operator training and certification — fast, compliant, and no BS.',
    images: [`${cdn}/images/generated/og-default.png`]
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [ { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' } ]
  },
  manifest: '/site.webmanifest'
};
