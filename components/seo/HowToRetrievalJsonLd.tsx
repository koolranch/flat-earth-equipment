'use client';

export default function HowToRetrievalJsonLd({ brand, steps, url }: { brand: string; steps: string[]; url: string }){
  if (!steps?.length) return null;
  
  const json = { 
    '@context':'https://schema.org', 
    '@type':'HowTo', 
    'name': `${brand} — How to Retrieve Fault Codes`, 
    'step': steps.map((s,i)=> ({ 
      '@type':'HowToStep', 
      'position': i+1, 
      'name': s.slice(0,80), 
      'text': s 
    })), 
    'tool': 'Onboard diagnostics/menu', 
    'totalTime': 'PT5M' 
  };
  
  return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
