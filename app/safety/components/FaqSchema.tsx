import Script from 'next/script';

export default function FaqSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      { '@type': 'Question', 'name': 'Will employers accept this online certification?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. The training aligns with OSHA 29 CFR 1910.178 and is accepted by employers nationwide. Bring your downloadable certificate and wallet card to the job site.' } },
      { '@type': 'Question', 'name': 'How fast can I get my certificate?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Most operators finish in under 60 minutes. The certificate is available for instant download upon passing the exam.' } },
      { '@type': 'Question', 'name': 'Is this the same as in-person classroom training?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, it covers the required instruction and evaluation components. Practical evaluation must be performed by your employer/supervisor on-site.' } },
      { '@type': 'Question', 'name': 'Do I need special equipment?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'No special equipment is needed for the online training. You will need access to a forklift on-site for the practical evaluation.' } },
      { '@type': 'Question', 'name': 'How long is the certification valid?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Certifications are typically valid for three years, with earlier retraining required if involved in an incident or assigned to a different truck type.' } }
    ]
  };
  return <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

