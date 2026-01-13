export interface FAQ {
  question: string;
  answer: string;
}

export const toyotaForkliftManualsFAQs: FAQ[] = [
  {
    question: "Which Toyota forklift manuals can I download here?",
    answer: "We offer operator manuals, parts manuals, and service manuals for Toyota forklifts. Our coverage includes popular series like 7FG, 8FG, 5FBE, 02-8FDF, and many others. Coverage varies by model and availability - some manuals are official OEM documents while others are equivalent reference materials."
  },
  {
    question: "What if my Toyota forklift manual isn't listed?",
    answer: "Use our manual request form to let us know what you need. We'll source the manual for you or suggest equivalent alternatives. Our team has access to extensive manual archives and can often locate hard-to-find documentation for older models."
  },
  {
    question: "Are these official OEM Toyota manuals?",
    answer: "Our manual collection may include both OEM and equivalent reference materials. Toyota is a registered trademark of Toyota Industries Corporation. All trademarks belong to their respective owners. For critical safety procedures, always follow your truck's official manual and OSHA/ANSI guidance."
  },
  {
    question: "How do I identify my Toyota forklift model and serial number?",
    answer: "Check the serial plate typically located on the frame near the operator compartment, on the firewall behind the seat, or on the counterweight. Toyota serial numbers often follow formats like 8FGCU25-12345 or 7FBEU18-67890. The model designation (like 8FGCU25) indicates the series, fuel type, and capacity."
  },
  {
    question: "Can you help me find parts from a manual diagram?",
    answer: "Absolutely! Send us a photo or screenshot of the parts diagram page, and we'll help identify and quote the components you need. Our parts specialists can cross-reference diagram numbers to current part numbers and provide pricing and availability."
  },
  {
    question: "Do you offer chargers or batteries for Toyota electric forklifts?",
    answer: "Yes, we carry battery chargers, replacement batteries, and charging accessories for Toyota electric forklifts. Our selection includes both OEM and compatible options. Visit our chargers section or contact us for recommendations based on your specific model."
  }
];

export function generateFAQPageJSONLD(faqs: FAQ[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function generateBreadcrumbJSONLD(): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.flatearthequipment.com/"
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": "Parts",
        "item": "https://www.flatearthequipment.com/parts"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Toyota Forklift Manuals",
        "item": "https://www.flatearthequipment.com/parts/toyota-forklift-manuals"
      }
    ]
  };
}
