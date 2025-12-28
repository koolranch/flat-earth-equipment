'use client'

import { CourseJsonLd, FAQPageJsonLd } from 'next-seo'

export default function SafetyJsonLd() {
  return (
    <>
      <CourseJsonLd
        courseName="Online Forklift Operator Certification"
        description="OSHA-compliant PIT theory plus employer sign-off kit."
        provider={{
          name: 'Flat Earth Safety',
          url: 'https://flatearthequipment.com',
        }}
      />
      <FAQPageJsonLd
        mainEntity={[
          {
            questionName: 'Is this forklift certification OSHA compliant?',
            acceptedAnswerText: 'Yes, our online training covers all OSHA requirements for powered industrial truck theory training. Your employer completes the practical evaluation using our provided checklist.',
          },
          {
            questionName: 'How long does the certification last?',
            acceptedAnswerText: 'OSHA requires forklift operators to be re-evaluated every 3 years, or sooner if involved in an accident or observed operating unsafely.',
          },
          {
            questionName: 'What is included in the $49 certification?',
            acceptedAnswerText: 'The certification includes comprehensive online theory training modules, quizzes to test your knowledge, a printable certificate upon completion, and an employer evaluation checklist for practical assessment.',
          },
          {
            questionName: 'Can I complete this training on my phone?',
            acceptedAnswerText: 'Yes, our training platform is fully mobile-responsive and works on any device with an internet connection.',
          },
          {
            questionName: 'Do I need my employer to complete the certification?',
            acceptedAnswerText: 'Yes, OSHA requires employers to conduct a practical evaluation of your forklift operation skills. We provide the evaluation checklist and instructions for your employer.',
          },
        ]}
      />
    </>
  )
} 