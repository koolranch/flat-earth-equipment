import Script from 'next/script';

/**
 * FaqSchema Component - Enhanced for Featured Snippet Targeting
 * 
 * Contains strategic OSHA training questions optimized for:
 * - "how to get forklift certified" (vol: 2,900)
 * - "forklift certification cost" (vol: 1,600)
 * - "how long is forklift certification good for" (vol: 1,000)
 * - "osha forklift training requirements" (vol: 720)
 */
export default function FaqSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      // HIGH-PRIORITY: Featured Snippet Target
      { 
        '@type': 'Question', 
        'name': 'How do I get forklift certified?', 
        'acceptedAnswer': { 
          '@type': 'Answer', 
          'text': 'To get forklift certified, you must complete two parts: (1) Formal instruction covering OSHA 29 CFR 1910.178 topics like pre-operation inspection, stability principles, and hazard awareness—available online in under 30 minutes, and (2) A hands-on practical evaluation performed by your employer on the specific forklift types you will operate. Upon completion, you receive a certificate valid for 3 years.' 
        } 
      },
      // HIGH-PRIORITY: Featured Snippet Target  
      { 
        '@type': 'Question', 
        'name': 'How much does forklift certification cost?', 
        'acceptedAnswer': { 
          '@type': 'Answer', 
          'text': 'Online forklift certification typically costs $49-$149 per operator. Traditional classroom training costs $200-$500 and requires travel. Flat Earth Safety offers OSHA-compliant online certification for $49, which includes interactive training, exam, instant certificate download, and wallet card—a savings of $150-$450 compared to classroom options.' 
        } 
      },
      // HIGH-PRIORITY: Featured Snippet Target
      { 
        '@type': 'Question', 
        'name': 'How long is forklift certification good for?', 
        'acceptedAnswer': { 
          '@type': 'Answer', 
          'text': 'Forklift certification is valid for 3 years per OSHA 29 CFR 1910.178(l)(4)(iii). However, retraining is required sooner if: (1) the operator is involved in an accident or near-miss, (2) observed operating unsafely, (3) assigned to a different type of truck, or (4) workplace conditions change significantly. Most employers require annual refresher evaluations.' 
        } 
      },
      // OSHA Requirements Target
      { 
        '@type': 'Question', 
        'name': 'What are the OSHA forklift training requirements?', 
        'acceptedAnswer': { 
          '@type': 'Answer', 
          'text': 'OSHA 29 CFR 1910.178(l) requires forklift operators to receive training in: (1) truck-related topics (operating instructions, warnings, differences between truck and automobile), (2) workplace-related topics (surface conditions, load manipulation, pedestrian traffic), and (3) practical evaluation on the equipment they will operate. Only trained and evaluated operators may operate powered industrial trucks.' 
        } 
      },
      // Employer Acceptance
      { 
        '@type': 'Question', 
        'name': 'Will employers accept online forklift certification?', 
        'acceptedAnswer': { 
          '@type': 'Answer', 
          'text': 'Yes. OSHA allows online training for the formal instruction component of forklift certification. The training must cover all required 29 CFR 1910.178 topics, followed by a practical evaluation at the workplace. Flat Earth Safety certificates are accepted by employers nationwide and include QR code verification.' 
        } 
      },
      // Time Investment
      { 
        '@type': 'Question', 
        'name': 'How long does it take to get forklift certified online?', 
        'acceptedAnswer': { 
          '@type': 'Answer', 
          'text': 'Online forklift certification takes 20-45 minutes for the formal instruction and exam. Flat Earth Safety\'s interactive training averages 25 minutes. The practical evaluation at your workplace typically takes 15-30 minutes. Total time: under 1 hour compared to 8+ hours for traditional classroom training.' 
        } 
      },
      // Certificate Validity
      { 
        '@type': 'Question', 
        'name': 'Is online forklift certification the same as in-person training?', 
        'acceptedAnswer': { 
          '@type': 'Answer', 
          'text': 'Yes, online certification covers the same OSHA-required topics as in-person classroom training. Both methods satisfy the formal instruction requirement. The key difference is convenience—online training can be completed anywhere, anytime, at your own pace. Both require a separate practical evaluation by the employer.' 
        } 
      },
      // What You Receive
      { 
        '@type': 'Question', 
        'name': 'What do I get when I complete forklift certification?', 
        'acceptedAnswer': { 
          '@type': 'Answer', 
          'text': 'Upon completing Flat Earth Safety certification, you receive: (1) Printable certificate with QR verification code, (2) Wallet-sized certification card, (3) Digital records accessible anytime, (4) Employer practical evaluation checklist (PDF), and (5) 3-year validity with renewal reminders.' 
        } 
      }
    ]
  };
  return <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

