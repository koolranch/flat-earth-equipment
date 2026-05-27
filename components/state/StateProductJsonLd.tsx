import { STATE_TO_USPS, slugToTitle } from '@/lib/state';

export default function StateProductJsonLd({ stateCode }: { stateCode: string }) {
  const slug = stateCode.toLowerCase();
  const STATE = slugToTitle(slug);
  const usps = STATE_TO_USPS[slug];
  const url = `https://www.flatearthequipment.com/safety/forklift/${slug}`;

  const areaServed =
    slug === 'tx'
      ? [
          { '@type': 'State', name: 'Texas' },
          { '@type': 'City', name: 'Dallas–Fort Worth' },
          { '@type': 'City', name: 'Dallas' },
          { '@type': 'City', name: 'Fort Worth' },
          { '@type': 'City', name: 'Arlington' },
        ]
      : usps
        ? `US-${usps}`
        : undefined;

  const about =
    slug === 'tx'
      ? [
          { '@type': 'Thing', name: 'forklift certification Dallas' },
          { '@type': 'Thing', name: 'OSHA forklift training Texas' },
          { '@type': 'Thing', name: 'DFW forklift certification' },
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
    ...(slug === 'tx'
      ? {
          audience: { '@type': 'BusinessAudience', name: 'General Contractors and Subcontractors' },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: '49.00',
      availability: 'https://schema.org/InStock',
      url,
      priceValidUntil: '2026-12-31',
      seller: {
        '@type': 'Organization',
        name: 'Flat Earth Equipment',
      },
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
