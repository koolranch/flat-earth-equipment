'use client';
import { useParams } from 'next/navigation';
import Script from 'next/script';
import { STATE_TO_USPS, slugToTitle } from '@/lib/state';

export default function StateProductJsonLd() {
  const params = useParams() as Record<string, string> | null;
  const slug = (params?.state || params?.slug || '').toLowerCase();
  const STATE = slugToTitle(slug);
  const usps = STATE_TO_USPS[slug];
  const url = typeof window !== 'undefined' ? window.location.href : `https://www.flatearthequipment.com/safety/forklift/${slug}`;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Online Forklift Certification — ${STATE}`,
    description:
      'OSHA 1910.178-aligned online forklift certification. Finish in 45–60 minutes. Same-day digital certificate & wallet card. Employer completes on-site evaluation.',
    brand: { '@type': 'Brand', name: 'Flat Earth Safety' },
    ...(usps ? { areaServed: `US-${usps}` } : {}),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '523'
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: '59.00',
      availability: 'https://schema.org/InStock',
      url,
      priceValidUntil: '2025-12-31',
      seller: {
        '@type': 'Organization',
        name: 'Flat Earth Equipment'
      }
    }
  } as const;

  return <Script id="state-product-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

