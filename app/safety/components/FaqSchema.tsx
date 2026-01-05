import Script from 'next/script';

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
export default function FaqSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How do I get forklift certified?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'To get forklift certified, you must complete two OSHA-required components: formal instruction (online or classroom) covering safety topics, and a hands-on practical evaluation performed by your employer on the specific equipment you\'ll operate. The certification process includes completing formal instruction covering OSHA 29 CFR 1910.178 topics (20-45 minutes online), passing a written or digital knowledge assessment, completing a practical driving evaluation at your workplace, and receiving your certificate and wallet card. Pro Tip: Certification is employer-specific and does not transfer between companies—when you change jobs, your new employer must verify your skills.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How much does forklift certification cost?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Online forklift certification costs $49 at Flat Earth Safety—significantly less than traditional classroom training at $200-$500. Both methods satisfy the same OSHA 29 CFR 1910.178 requirements, so the price difference reflects delivery convenience, not certification quality. Our $49 certification includes interactive training modules, knowledge assessment, instant certificate download, printable wallet card, and employer evaluation checklist. Pro Tip: Some employers reimburse certification costs—ask your HR department before paying out-of-pocket, as many warehousing and logistics companies cover operator training expenses.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How long is forklift certification good for?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Forklift certification is valid for 3 years under OSHA regulation 29 CFR 1910.178(l)(4)(iii). However, retraining must occur sooner if: the operator is involved in an accident or near-miss, the operator is observed operating unsafely, the operator is assigned to a different truck type, or workplace conditions change significantly. Pro Tip: While OSHA mandates 3-year recertification, most employers conduct annual refresher evaluations as a best practice.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What are the OSHA forklift training requirements?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'OSHA requires forklift operators to receive training in truck-related topics, workplace-related topics, and a practical evaluation—all documented by the employer before operating any powered industrial truck unsupervised. Truck-related topics include operating instructions, vehicle capacity, stability principles, and refueling procedures. Workplace-related topics include surface conditions, load handling, pedestrian traffic, and hazardous locations. Pro Tip: OSHA doesn\'t specify minimum training hours—only that operators demonstrate competency. A 30-minute online course that covers all topics is equally valid as an 8-hour classroom session.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is online forklift certification valid?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes, online forklift certification is valid and OSHA-compliant when it covers all required 29 CFR 1910.178 topics and is followed by an employer-conducted practical evaluation on the actual equipment the operator will use. Online training must cover all formal instruction topics, include knowledge assessment, provide documentation for employer records, and be paired with hands-on practical evaluation. Pro Tip: OSHA doesn\'t distinguish between online and classroom delivery—both satisfy the "formal instruction" requirement.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Do I need a forklift license to operate a forklift?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'No, there is no government-issued "forklift license." Instead, OSHA requires operators to be trained and certified by their employer before operating powered industrial trucks. This certification is workplace-specific, not a transferable license. The term "forklift license" is informal—no such government credential exists. "Forklift certification" refers to employer documentation that training was completed. Pro Tip: Unlike a driver\'s license, forklift certification doesn\'t follow you between employers—each new employer must verify your competency and provide site-specific training.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How long does forklift training take?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Forklift training takes 20-45 minutes for online formal instruction, plus 15-30 minutes for the practical evaluation—allowing most operators to complete full certification in under 2 hours compared to 8+ hours for traditional classroom programs. Online training includes formal instruction (20-45 min), knowledge test (10-15 min), and practical evaluation (15-30 min) for a total of 45-90 minutes. Pro Tip: OSHA doesn\'t mandate minimum training hours—only that operators demonstrate safe operation.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Can I get forklift certified without a job?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes, you can complete the formal instruction portion of forklift certification without current employment, but you cannot be fully certified until an employer conducts the required hands-on practical evaluation on their equipment. Before employment, you can complete online formal instruction, receive a training completion certificate, and add it to your resume. However, you cannot complete the practical evaluation or operate a forklift unsupervised without an employer. Pro Tip: Having a training completion certificate shows employers initiative and reduces their onboarding time.'
        }
      }
    ]
  };
  return <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

