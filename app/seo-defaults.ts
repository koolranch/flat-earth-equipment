import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com';
const cdn = (process.env.NEXT_PUBLIC_SUPABASE_URL || '') + '/storage/v1/object/public/' + (process.env.NEXT_PUBLIC_ASSET_BUCKET || 'public-assets');

// Utility pages that should be noindex, nofollow
const NOINDEX_PATHS = ['/login', '/register', '/redeem', '/verify', '/reset-password', '/callback'];

/**
 * Strip query parameters from a pathname.
 * Handles both URL strings and pathname strings.
 * @param pathname - The pathname possibly with query string
 * @returns Clean pathname without query parameters
 */
function stripQueryParams(pathname: string): string {
  // Handle full URLs or paths with query strings
  const questionIndex = pathname.indexOf('?');
  const hashIndex = pathname.indexOf('#');
  
  let cleanPath = pathname;
  if (questionIndex !== -1) {
    cleanPath = pathname.substring(0, questionIndex);
  }
  if (hashIndex !== -1 && (questionIndex === -1 || hashIndex < questionIndex)) {
    cleanPath = pathname.substring(0, hashIndex);
  }
  
  // Ensure pathname starts with /
  return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
}

/**
 * Generate a canonical URL that strips query parameters.
 * This prevents index bloat from search/filter pages.
 * @param pathname - The pathname (query params will be stripped)
 * @returns Full canonical URL (absolute)
 */
export function getCanonicalUrl(pathname: string): string {
  const cleanPath = stripQueryParams(pathname);
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Check if a pathname is a utility page that should be noindex.
 * @param pathname - The pathname to check
 * @returns true if the page should be noindex
 */
export function isNoIndexPath(pathname: string): boolean {
  const cleanPath = stripQueryParams(pathname);
  return NOINDEX_PATHS.some(p => cleanPath === p || cleanPath.startsWith(`${p}/`));
}

/**
 * Generate proper alternates metadata with:
 * - Self-referencing canonical URL (absolute URL with domain)
 * - Self-referencing hreflang for en-US (primary locale)
 * - x-default hreflang pointing to current page
 * 
 * Query parameters are automatically stripped to prevent duplicate content.
 * Canonical is always an absolute URL to avoid Google Search Console issues.
 * 
 * @param pathname - The pathname (query params will be stripped automatically)
 * @returns Metadata alternates object with canonical and languages
 */
export function generatePageAlternates(pathname: string): Metadata['alternates'] {
  const cleanPath = stripQueryParams(pathname);
  const fullUrl = `${SITE_URL}${cleanPath}`;
  
  return {
    canonical: fullUrl, // Absolute URL, query params stripped
    languages: {
      'en-US': fullUrl,
      'x-default': fullUrl,
    },
  };
}

/**
 * Generate complete page metadata including alternates and robots.
 * Automatically handles:
 * - Query parameter stripping for canonical URLs
 * - noindex for utility pages (login, register, redeem, etc.)
 * - Self-referencing hreflang tags
 * 
 * @param pathname - The pathname (query params will be stripped automatically)
 * @returns Metadata object with alternates and robots
 */
export function generatePageMetadata(pathname: string): Pick<Metadata, 'alternates' | 'robots'> {
  const cleanPath = stripQueryParams(pathname);
  const shouldNoIndex = isNoIndexPath(cleanPath);
  
  return {
    alternates: generatePageAlternates(cleanPath),
    robots: shouldNoIndex 
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/**
 * Generate metadata with self-referencing canonical URL.
 * Always strips query parameters from the canonical.
 * @deprecated Use generatePageAlternates or generatePageMetadata instead
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
