import type { MarketingDict } from '@/i18n';

/**
 * FaqSchema Component - Enhanced for Featured Snippet Targeting
 * 
 * Contains 8 strategic OSHA training questions optimized for:
 * - "how to get forklift certified" (vol: 2,900)
 * - "forklift certification cost" (vol: 1,600)
 * - "how long is forklift certification good for" (vol: 1,000)
 * - "osha forklift training requirements" (vol: 720)
 * - "is online forklift certification valid" (vol: 480)
 * - "do i need forklift license" (vol: 390)
 * - "how long does forklift training take" (vol: 320)
 * - "forklift certified without job" (vol: 210)
 * 
 * Each FAQ includes:
 * - PAA-style question phrasing
 * - Snippet bait answer (under 50 words, direct)
 * - Detailed context with OSHA citations
 * - Information gain "pro tip" competitors omit
 */
export default function FaqSchema({ t }: { t: MarketingDict }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: t.safety.jsonLd.inLanguage,
    mainEntity: t.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
  // Raw inline script (not next/script) so the FAQPage schema is present in the
  // server-rendered HTML where crawlers can see it without executing JS.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

