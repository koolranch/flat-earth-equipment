import JsonLd from '@/components/seo/JsonLd';

const Q = [
  { 
    q: 'Where can I find the serial number plate on {brand}?', 
    a: 'Common locations include the dashboard cowl, chassis near the counterweight, inside the operator compartment, or on the frame near the mast. Compare with any stamped frame number if present.' 
  },
  { 
    q: 'What\'s the difference between model and serial number on {brand}?', 
    a: 'The model identifies the configuration/series, while the serial is unique to the unit and may encode plant or year depending on the brand.' 
  },
  { 
    q: 'Can fault codes alone diagnose a {brand}?', 
    a: 'Fault codes are a starting point. Verify basics (battery voltage, connectors, fluid levels) and follow official procedures before replacing parts.' 
  },
  { 
    q: 'Do I need the serial number to order parts for my {brand}?', 
    a: 'It greatly improves accuracy. Serial ranges can change component suppliers mid-series; sharing your serial helps match the correct parts the first time.' 
  },
  { 
    q: 'What if the plate on my {brand} is missing?', 
    a: 'Look for stamped frame numbers, controller or engine labels, or maintenance records. Photos of the unit and key components also help.' 
  }
];

interface BrandFaqJsonLdProps {
  brandName: string;
}

export default function BrandFaqJsonLd({ brandName }: BrandFaqJsonLdProps) {
  const mainEntity = Q.map(({ q, a }) => ({
    '@type': 'Question',
    name: q.replace(/{brand}/g, brandName),
    acceptedAnswer: {
      '@type': 'Answer',
      text: a.replace(/{brand}/g, brandName)
    }
  }));

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity
  };

  return <JsonLd json={faqSchema} />;
}
