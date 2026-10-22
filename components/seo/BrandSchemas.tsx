import Script from 'next/script';

interface Brand {
  slug: string;
  name: string;
  logo_url?: string;
  description?: string;
  equipment_types?: string[];
  website_url?: string;
}

interface BrandSchemasProps {
  brand: Brand;
}

export function BrandSchemas({ brand }: BrandSchemasProps) {
  // Organization Schema for the brand
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": brand.name,
    "description": brand.description || `Parts for ${brand.name} are on the catalog. A listing is not a fit for every machine.`,
    "url": brand.website_url,
    "logo": brand.logo_url,
    "sameAs": brand.website_url ? [brand.website_url] : undefined
  };

  // WebApplication Schema for the brand support tool
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${brand.name} Equipment Support Tool`,
    "description": `Parts for ${brand.name} are on the catalog. A listing is not a fit for every machine.`,
    "url": `https://flatearthequipment.com/brand/${brand.slug}`,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "description": "Freight is calculated at checkout"
    },
    "featureList": [
      "Serial number lookup where that page exists",
      "Parts catalog"
    ],
    "provider": {
      "@type": "Organization",
      "name": "Flat Earth Equipment",
      "url": "https://flatearthequipment.com"
    }
  };

  // FAQ Schema for common questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How do I find the serial number on my ${brand.name} equipment?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Use the ${brand.name} serial lookup when that page exists. This page does not list plate locations.`
        }
      },
      {
        "@type": "Question", 
        "name": `What information can I get from my ${brand.name} serial number?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `This page does not publish a model year from the serial number.`
        }
      },
      {
        "@type": "Question",
        "name": `How quickly can you source ${brand.name} parts?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Parts we list are on the catalog. Freight is calculated at checkout.`
        }
      },
      {
        "@type": "Question",
        "name": `Do you have ${brand.name} fault code information?`,
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": `This page does not publish a fault-code database for every brand.`
        }
      }
    ]
  };

  // Product Schema for parts/service offering
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${brand.name} Equipment Parts & Support`,
    "description": `Parts for ${brand.name} are on the catalog. A listing is not a fit for every machine. Freight is calculated at checkout.`,
    "provider": {
      "@type": "Organization",
      "name": "Flat Earth Equipment",
      "url": "https://flatearthequipment.com",
      "telephone": "+1-888-392-9175"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "serviceType": "Equipment Parts & Support",
    "offers": {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "USD",
        "description": "Freight is calculated at checkout"
      }
    }
  };

  return (
    <>
      <Script
        id="brand-organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      
      <Script
        id="brand-webapp-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema)
        }}
      />
      
      <Script
        id="brand-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />
      
      <Script
        id="brand-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema)
        }}
      />
    </>
  );
}
