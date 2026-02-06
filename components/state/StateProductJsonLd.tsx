'use client';
import { useParams } from 'next/navigation';
import Script from 'next/script';
import { STATE_TO_USPS, slugToTitle } from '@/lib/state';

export default function StateProductJsonLd() {
  const params = useParams() as Record<string, string> | null;
  const slug = (params?.state || params?.slug || '').toLowerCase();
  const STATE = slugToTitle(slug);
  const usps = STATE_TO_USPS[slug];
  const url = typeof window !== 'undefined' ? window.location.href : `https://flatearthequipment.com/safety/forklift/${slug}`;

  // Enhanced schema for Texas with DFW coverage
  const areaServed = slug === 'tx' 
    ? [
        { '@type': 'State', name: 'Texas' },
        { '@type': 'City', name: 'Dallas–Fort Worth' },
        { '@type': 'City', name: 'Dallas' },
        { '@type': 'City', name: 'Fort Worth' },
        { '@type': 'City', name: 'Arlington' }
      ]
    : (usps ? `US-${usps}` : undefined);

  const about = slug === 'tx'
    ? [
        { '@type': 'Thing', name: 'forklift certification Dallas' },
        { '@type': 'Thing', name: 'OSHA forklift training Texas' },
        { '@type': 'Thing', name: 'DFW forklift certification' }
      ]
    : undefined;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Online Forklift Certification — ${STATE}`,
    description:
      'OSHA 1910.178-aligned online forklift certification. Finish in under 30 minutes. Same-day digital certificate & wallet card. Employer completes on-site evaluation.',
    brand: { '@type': 'Brand', name: 'Flat Earth Safety' },
    ...(areaServed ? { areaServed } : {}),
    ...(about ? { about } : {}),
    ...(slug === 'tx' ? { 
      audience: { '@type': 'BusinessAudience', name: 'General Contractors and Subcontractors' }
    } : {}),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '523'
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: '49.00',
      availability: 'https://schema.org/InStock',
      url,
      priceValidUntil: '2026-12-31',
      seller: {
        '@type': 'Organization',
        name: 'Flat Earth Equipment'
      }
    }
  };

  return <Script id="state-product-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

