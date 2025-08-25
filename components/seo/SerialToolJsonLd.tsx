'use client';

interface SerialToolJsonLdProps {
  brand?: { slug: string; name: string };
  url: string;
  name?: string; // Legacy support
}

export default function SerialToolJsonLd({ brand, url, name }: SerialToolJsonLdProps){
  const toolName = name || (brand ? `${brand.name} Serial Number Lookup` : 'Serial Number Lookup');
  
  const json = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': toolName,
    'url': url,
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web',
    'offers': { '@type': 'Offer', 'price': 0, 'priceCurrency': 'USD' },
    'provider': { '@type': 'Organization', 'name': 'Flat Earth Equipment', 'url': 'https://www.flatearthequipment.com' }
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}