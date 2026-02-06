'use client'

/**
 * FAQ Schema - Generated from the same source as the visible FAQ
 * to ensure schema matches on-page content (avoids Google penalties).
 * 
 * NOTE: The Course JSON-LD is rendered inline in page.tsx to avoid duplicates.
 */
export default function SafetyJsonLd() {
  // These must match the FAQ items in i18n/marketing.en.ts exactly
  const faqItems = [
    {
      question: 'Will employers accept this online certification?',
      answer: 'Yes. OSHA 29 CFR 1910.178 allows online training for the formal instruction component. Our training is accepted by employers nationwide. Your certificate includes QR verification for instant employer validation.',
    },
    {
      question: 'How fast can I get my certificate?',
      answer: 'Most operators complete training in 45-60 minutes. Your certificate is available for immediate download upon passing the final exam. You can start applying for jobs the same day.',
    },
    {
      question: 'Is this the same as in-person classroom training?',
      answer: 'Yes, for the formal instruction component. OSHA requires both classroom training AND workplace evaluation. Our online course covers the classroom portion (same content as 8-hour classes). Your employer completes a brief practical evaluation on-site using our provided form.',
    },
    {
      question: 'What if I fail the exam?',
      answer: 'You can retake quizzes and the final exam as many times as needed at no additional cost. Most operators pass on the first attempt.',
    },
    {
      question: 'Do I need any special equipment?',
      answer: 'No. Works on any phone, tablet, or computer with internet access. No apps to download.',
    },
    {
      question: 'How long is the certification valid?',
      answer: '3 years. OSHA requires recertification every 3 years or when changing equipment types.',
    },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
    />
  )
} 