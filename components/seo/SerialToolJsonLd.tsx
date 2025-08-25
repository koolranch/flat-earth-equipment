import JsonLd from '@/components/seo/JsonLd';

interface SerialToolJsonLdProps {
  name: string;
  url: string;
}

export default function SerialToolJsonLd({ name, url }: SerialToolJsonLdProps) {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    applicationCategory: 'Utility',
    url: `https://www.flatearthequipment.com${url}`,
    publisher: {
      '@type': 'Organization',
      name: 'Flat Earth Equipment',
      url: 'https://www.flatearthequipment.com'
    },
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };

  return <JsonLd json={webAppSchema} />;
}
