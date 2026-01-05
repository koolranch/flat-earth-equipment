'use client';

import { useState, useMemo } from 'react';
import Script from 'next/script';

interface ParsedFaultCode {
  code: string;
  description: string;
}

interface ProductSupportFAQProps {
  /** Pipe-delimited fault codes string from Stripe metadata */
  faultCodes?: string;
  /** Product name for context */
  productName?: string;
  /** Additional FAQ items to include */
  additionalFaqs?: Array<{ question: string; answer: string }>;
  /** Whether to inject JSON-LD schema */
  includeSchema?: boolean;
  /** URL to product manual PDF for download CTA */
  manualUrl?: string;
}

/**
 * ProductSupportFAQ Component
 * 
 * Displays common fault codes as an FAQ section with:
 * - Expandable accordion for each fault code
 * - Schema.org FAQPage JSON-LD for rich results
 * - Mobile-responsive design
 * 
 * Designed for SKU-specific product pages to improve:
 * - Information Gain (competitors don't show fault codes)
 * - Featured Snippet eligibility for "what does [code] mean" queries
 * - E-E-A-T signals (expert technical knowledge)
 */
export default function ProductSupportFAQ({
  faultCodes,
  productName = 'Charger Module',
  additionalFaqs = [],
  includeSchema = true,
  manualUrl,
}: ProductSupportFAQProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Parse fault codes from pipe-delimited string
  const parsedFaultCodes = useMemo((): ParsedFaultCode[] => {
    if (!faultCodes) return [];
    
    return faultCodes.split('|').map(item => {
      const colonIndex = item.indexOf(':');
      if (colonIndex === -1) {
        return { code: item.trim(), description: 'See manual for details' };
      }
      return {
        code: item.slice(0, colonIndex).trim(),
        description: item.slice(colonIndex + 1).trim(),
      };
    });
  }, [faultCodes]);

  // Generate FAQ items for schema
  const faqItems = useMemo(() => {
    const items: Array<{ question: string; answer: string }> = [];

    // Add fault code FAQs
    parsedFaultCodes.forEach(fc => {
      items.push({
        question: `What does fault code ${fc.code} mean on my ${productName}?`,
        answer: `Fault code ${fc.code} indicates: ${fc.description}. This is a common diagnostic code on Enersys and Hawker charger modules. If the fault persists after addressing the root cause, the module may require professional repair or replacement.`,
      });
    });

    // Add additional FAQs
    items.push(...additionalFaqs);

    return items;
  }, [parsedFaultCodes, productName, additionalFaqs]);

  // Generate JSON-LD schema
  const schemaData = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqItems.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  }), [faqItems]);

  if (parsedFaultCodes.length === 0 && additionalFaqs.length === 0) {
    return null;
  }

  return (
    <>
      {/* JSON-LD Schema for FAQPage */}
      {includeSchema && faqItems.length > 0 && (
        <Script
          id="product-faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}

      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 to-red-800 text-white px-6 py-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Common Fault Codes & Troubleshooting
          </h3>
          <p className="text-sm text-red-200 mt-1">
            Reference guide for {productName} diagnostic codes
          </p>
        </div>

        {/* Fault Code Accordion */}
        <div className="divide-y divide-slate-200">
          {parsedFaultCodes.map((fc, index) => (
            <div key={fc.code} className="group">
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                aria-expanded={expandedIndex === index}
              >
                <div className="flex items-center gap-4">
                  <span className={`
                    px-3 py-1 rounded-md font-mono font-bold text-sm
                    ${fc.code === 'TH' ? 'bg-red-100 text-red-700' : ''}
                    ${fc.code === 'DF3' || fc.code === 'DF4' ? 'bg-amber-100 text-amber-700' : ''}
                    ${fc.code === 'HV' || fc.code === 'LV' ? 'bg-blue-100 text-blue-700' : ''}
                    ${fc.code === 'OC' ? 'bg-purple-100 text-purple-700' : ''}
                    ${!['TH', 'DF3', 'DF4', 'HV', 'LV', 'OC'].includes(fc.code) ? 'bg-slate-100 text-slate-700' : ''}
                  `}>
                    {fc.code}
                  </span>
                  <span className="font-medium text-slate-900">
                    {fc.description.split('/')[0].trim()}
                  </span>
                </div>
                <svg 
                  className={`w-5 h-5 text-slate-400 transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedIndex === index && (
                <div className="px-6 pb-4 bg-slate-50">
                  <div className="pl-16 space-y-3">
                    <p className="text-slate-700">{fc.description}</p>
                    
                    {/* Context-specific troubleshooting tips */}
                    {fc.code === 'TH' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                          <strong>Troubleshooting:</strong> Check that the thermal pad is properly installed and the IGBT 
                          mounting screws are torqued to 0.8 N·m. Verify adequate ventilation around the charger.
                        </p>
                      </div>
                    )}
                    
                    {(fc.code === 'DF3' || fc.code === 'DF4') && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">
                          <strong>Troubleshooting:</strong> Check battery connections for corrosion or loose terminals. 
                          Verify battery voltage with a multimeter before connecting to charger.
                        </p>
                      </div>
                    )}
                    
                    {(fc.code === 'HV' || fc.code === 'LV') && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Troubleshooting:</strong> Check input voltage at the charger terminals. Verify 
                          3-phase power supply is within ±10% of rated voltage (208-480 VAC).
                        </p>
                      </div>
                    )}
                    
                    {fc.code === 'OC' && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-purple-800">
                          <strong>Troubleshooting:</strong> Check output cables for shorts or damaged insulation. 
                          Verify battery capacity matches charger output rating.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional FAQs */}
        {additionalFaqs.length > 0 && (
          <>
            <div className="px-6 py-3 bg-slate-100 border-t">
              <h4 className="font-semibold text-slate-700">Frequently Asked Questions</h4>
            </div>
            <div className="divide-y divide-slate-200">
              {additionalFaqs.map((faq, index) => (
                <div key={index} className="px-6 py-4">
                  <h5 className="font-medium text-slate-900 mb-2">{faq.question}</h5>
                  <p className="text-slate-600 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer CTA */}
        <div className="px-6 py-4 bg-slate-50 border-t">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Still seeing fault codes after troubleshooting?
            </p>
            <div className="flex items-center gap-4">
              {manualUrl && (
                <a 
                  href={manualUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Manual
                </a>
              )}
              <a 
                href="/charger-modules"
                className="text-sm font-medium text-canyon-rust hover:text-canyon-rust/80 transition-colors"
              >
                Get a Quote for Repair →
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

