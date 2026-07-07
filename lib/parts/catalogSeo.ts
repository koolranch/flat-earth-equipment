import type { Metadata } from 'next';
import { generateOpenGraph, generatePageAlternates } from '@/app/seo-defaults';
import type { CatalogPart, CatalogSearchParams } from '@/lib/parts/catalogQuery';
import { getCatalogPageTitle } from '@/lib/parts/catalogContext';

const BASE_TITLE = 'Forklift & Equipment Parts Catalog';
const BASE_DESCRIPTION =
  'Shop forklift parts, JCB aftermarket components, rubber tracks, lithium batteries, charger modules, and aerial lift parts. Search by OEM part number or browse by brand — fast shipping nationwide.';

type CategoryFacet = { slug: string; name: string };

export function buildCatalogMetadata(
  searchParams: CatalogSearchParams,
  categories: CategoryFacet[],
): Metadata {
  const pageTitle = getCatalogPageTitle(searchParams, categories);
  const isBasePage = pageTitle === 'Forklift & Equipment Parts';

  let title = BASE_TITLE;
  let description = BASE_DESCRIPTION;

  if (!isBasePage) {
    title = `${pageTitle} | Parts Catalog`;
    description = `Browse ${pageTitle.toLowerCase()} from Flat Earth Equipment. OEM-equivalent replacements, 12-month warranty, and same-day shipping on in-stock items. Search by part number or request a quote.`;
  }

  if (searchParams.q) {
    title = `${searchParams.q} — Parts Search Results`;
    description = `Search results for “${searchParams.q}” in the Flat Earth Equipment parts catalog. OEM cross-reference, online checkout, and quote requests available.`;
  }

  const pathname = '/parts';

  return {
    title,
    description,
    alternates: generatePageAlternates(pathname),
    openGraph: generateOpenGraph(pathname, title, description),
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

export function buildCatalogItemListJsonLd(parts: CatalogPart[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Flat Earth Equipment Parts Catalog',
    description: BASE_DESCRIPTION,
    url: 'https://www.flatearthequipment.com/parts',
    numberOfItems: parts.length,
    itemListElement: parts.map((part, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://www.flatearthequipment.com/parts/${part.slug}`,
      name: part.name,
    })),
  };
}

export const PARTS_CATALOG_FAQ = [
  {
    q: 'How do I find the right part for my machine?',
    a: 'Search by OEM part number, vendor SKU, or brand name in the catalog search bar. For serial-number fitment on Bobcat, Kubota, JCB, Case, and Takeuchi equipment, use our free serial lookup tools linked above the product grid.',
  },
  {
    q: 'What is the difference between Shop Online and Request Quote?',
    a: 'Shop Online parts have a listed price and checkout through the site with freight calculated at checkout. Request Quote items are OEM catalog stubs — submit your part number and our team will cross-reference availability and send pricing.',
  },
  {
    q: 'Do parts include a warranty?',
    a: 'Yes. Aftermarket parts purchased through Flat Earth Equipment include a 12-month warranty from the date of purchase. Rubber tracks ship with a 2-year warranty and free freight.',
  },
  {
    q: 'How fast do in-stock parts ship?',
    a: 'In-stock parts with online checkout typically ship the same business day when ordered before cutoff. Filter by Ships Today to see items ready for immediate shipment.',
  },
] as const;

export function buildCatalogFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PARTS_CATALOG_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export const SERIAL_LOOKUP_SHORTCUTS = [
  { label: 'Kubota', href: '/kubota-serial-number-lookup' },
  { label: 'Bobcat', href: '/bobcat-serial-number-lookup' },
  { label: 'JCB', href: '/jcb-serial-number-lookup' },
  { label: 'Case', href: '/case-serial-number-lookup' },
  { label: 'Takeuchi', href: '/takeuchi-serial-number-lookup' },
] as const;
