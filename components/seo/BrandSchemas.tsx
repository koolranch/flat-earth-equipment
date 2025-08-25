import Script from 'next/script';

interface Brand {
  slug: string;
  name: string;
  logo_url?: string;
  description?: string;
  equipment_types: string[];
  website_url?: string;
}

interface BrandSchemasProps {
  brand: Brand;
}

export function BrandSchemas({ brand }: BrandSchemasProps) {
  const equipmentList = brand.equipment_types.join(', ');
  
  // Organization Schema for the brand
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": brand.name,
    "description": brand.description || `${brand.name} equipment parts, serial number lookup, and fault code support`,
    "url": brand.website_url,
    "logo": brand.logo_url,
    "sameAs": brand.website_url ? [brand.website_url] : undefined
  };

  // WebApplication Schema for the brand support tool
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${brand.name} Equipment Support Tool`,
    "description": `Comprehensive support tool for ${brand.name} ${equipmentList} including serial number lookup, fault code database, and parts sourcing`,
    "url": `https://www.flatearthequipment.com/brand/${brand.slug}`,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "featureList": [
      "Serial Number Lookup",
      "Fault Code Database", 
      "Parts Request System",
      "Technical Support"
    ],
    "provider": {
      "@type": "Organization",
      "name": "Flat Earth Equipment",
      "url": "https://www.flatearthequipment.com"
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
          "text": `Use our ${brand.name} serial lookup tool to get step-by-step guidance on locating the serial number plate for your specific model. Common locations include the data plate on the counterweight, mast, operator compartment, or frame rails.`
        }
      },
      {
        "@type": "Question", 
        "name": `What information can I get from my ${brand.name} serial number?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Your ${brand.name} serial number can reveal the model year, manufacturing date, specifications, and help identify the correct parts for your equipment. Our lookup tool provides detailed decoding information.`
        }
      },
      {
        "@type": "Question",
        "name": `How quickly can you source ${brand.name} parts?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most standard ${brand.name} parts ship the same day for orders placed by 3 PM EST. We offer free shipping on standard items, with larger freight items shipping at cost. Our team responds to parts requests within 24 hours."
        }
      },
      {
        "@type": "Question",
        "name": `Do you have ${brand.name} fault code information?`,
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": `Yes, our database includes ${brand.name} fault codes with descriptions, severity levels, and recommended solutions. Search by code number or description to quickly identify and resolve equipment issues.`
        }
      }
    ]
  };

  // Product Schema for parts/service offering
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${brand.name} Equipment Parts & Support`,
    "description": `Professional parts sourcing, serial number lookup, and technical support for ${brand.name} ${equipmentList}`,
    "provider": {
      "@type": "Organization",
      "name": "Flat Earth Equipment",
      "url": "https://www.flatearthequipment.com",
      "telephone": "+1-555-123-4567"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "serviceType": "Equipment Parts & Support",
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free shipping on standard items"
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
