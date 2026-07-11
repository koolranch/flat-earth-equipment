'use client'

import Script from 'next/script'
import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface FAQItem {
  question: string
  answer: string
}

interface SEOComponentsProps {
  title: string
  description: string
  publishDate: string
  faqs?: FAQItem[]
}

function parseFaqs(faqs?: FAQItem[], faqsJson?: string): FAQItem[] {
  if (Array.isArray(faqs) && faqs.length > 0) return faqs
  if (typeof faqsJson === 'string' && faqsJson.trim()) {
    try {
      const parsed = JSON.parse(faqsJson.replace(/&#39;/g, "'"))
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

// FAQ Component with structured data
// next-mdx-remote RSC only passes string literal props — use faqsJson='[...]' in MDX
export function FAQSection({
  faqs,
  faqsJson,
}: {
  faqs?: FAQItem[]
  faqsJson?: string
}) {
  const resolvedFaqs = parseFaqs(faqs, faqsJson)
  if (resolvedFaqs.length === 0) return null

  return (
    <div className="my-12">
      <h2 id="frequently-asked-questions" className="text-2xl font-bold text-slate-900 mb-8">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {resolvedFaqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const paragraphs = (answer ?? '').split('\n')

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-slate-900 pr-4">
          {question}
        </h3>
        <div className="flex-shrink-0 w-5 h-5 text-canyon-rust transition-transform">
          {isOpen ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 border-t border-slate-200">
          <div className="text-slate-700 prose prose-slate max-w-none pt-4">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced Structured Data Component
export function StructuredData({ title, description, publishDate, faqs }: SEOComponentsProps) {
  const resolvedFaqs = faqs ?? []

  // Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "datePublished": publishDate,
    "dateModified": publishDate,
    "author": {
      "@type": "Organization",
      "name": "Flat Earth Equipment",
      "url": "https://flatearthequipment.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Flat Earth Equipment",
      "logo": {
        "@type": "ImageObject",
        "url": "https://flatearthequipment.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://flatearthequipment.com/insights/complete-guide-forklift-battery-chargers"
    }
  }

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": resolvedFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  // HowTo Schema for charger selection
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Select the Right Forklift Battery Charger",
    "description": "Step-by-step guide to choosing the correct forklift battery charger for your equipment",
    "totalTime": "PT15M",
    "supply": [
      "Battery nameplate information",
      "Forklift specifications",
      "Facility electrical information"
    ],
    "tool": [
      "Multimeter",
      "Calculator",
      "Electrical panel access"
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "Identify Battery Specifications",
        "text": "Locate the battery nameplate and record voltage (24V, 36V, 48V, or 80V), capacity in amp-hours (Ah), and connector type.",
        "position": 1
      },
      {
        "@type": "HowToStep", 
        "name": "Determine Operational Requirements",
        "text": "Analyze your operation schedule: single shift (8 hours), two shifts (16 hours), or continuous (24 hours). Identify available charging windows.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Calculate Required Amperage",
        "text": "Use the formula: Required Amps = (Battery Ah ÷ Charge Hours) ÷ 0.85. For maximum battery life, use C/10 rate (10% of capacity).",
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "Assess Electrical Infrastructure",
        "text": "Check available power: single-phase 208V-240V for smaller chargers, three-phase 480V-600V for larger ones. Verify panel capacity.",
        "position": 4
      },
      {
        "@type": "HowToStep",
        "name": "Plan Installation Requirements", 
        "text": "Ensure proper ventilation for hydrogen gas removal. Plan charger mounting location with 3-foot clearances. Install safety equipment.",
        "position": 5
      },
      {
        "@type": "HowToStep",
        "name": "Select and Order Charger",
        "text": "Choose between conventional, high-frequency, or smart chargers. Verify voltage match, connector compatibility, and amperage requirements.",
        "position": 6
      }
    ]
  }

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://flatearthequipment.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Insights",
        "item": "https://flatearthequipment.com/insights"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Complete Guide to Forklift Battery Chargers",
        "item": "https://flatearthequipment.com/insights/complete-guide-forklift-battery-chargers"
      }
    ]
  }

  return (
    <>
      {/* Article Schema */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema)
        }}
      />

      {/* FAQ Schema */}
      {resolvedFaqs.length > 0 && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema)
          }}
        />
      )}

      {/* HowTo Schema */}
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema)
        }}
      />

      {/* Breadcrumb Schema */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
    </>
  )
}
