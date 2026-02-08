'use client';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbJsonLd - JSON-LD structured data for breadcrumb navigation
 * Implements Schema.org BreadcrumbList type for rich results in Google
 * 
 * @example
 * <BreadcrumbJsonLd
 *   items={[
 *     { name: 'Home', url: 'https://www.flatearthequipment.com' },
 *     { name: 'Insights', url: 'https://www.flatearthequipment.com/insights' },
 *     { name: 'Forklift Maintenance', url: 'https://www.flatearthequipment.com/insights/forklift-maintenance' },
 *   ]}
 * />
 */
export default function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  if (!items?.length) return null;

  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
