'use client';

export default function BrandFaqJsonLd({ faqs, url }: { faqs: { q: string; a: string }[]; url: string }){
  if (!faqs?.length) return null;
  
  const json = { 
    '@context':'https://schema.org', 
    '@type':'FAQPage', 
    'mainEntity': faqs.map(f => ({ 
      '@type': 'Question', 
      'name': f.q, 
      'acceptedAnswer': { '@type': 'Answer', 'text': f.a } 
    })) 
  };
  
  return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
