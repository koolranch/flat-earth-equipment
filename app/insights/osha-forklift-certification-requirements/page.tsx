import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'OSHA Forklift Operator Training & Certification (29 CFR 1910.178(l)) – Summary & Compliance Guide',
  description: 'Neutral summary of OSHA 29 CFR 1910.178(l) forklift operator training, certification, and three-year evaluation requirements with official references.',
  alternates: {
    canonical: 'https://flatearthequipment.com/insights/osha-forklift-certification-requirements',
  },
  openGraph: {
    type: 'article',
    title: 'OSHA Forklift Operator Training & Certification (29 CFR 1910.178(l))',
    description: 'Neutral summary of OSHA forklift operator certification and evaluation requirements.',
    url: 'https://flatearthequipment.com/insights/osha-forklift-certification-requirements',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OSHA Forklift Operator Training & Certification (29 CFR 1910.178(l))',
    description: 'Neutral summary of OSHA forklift operator certification and evaluation requirements.',
  },
};

export default function OSHAForkliftCertificationPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'OSHA Forklift Operator Training & Certification (29 CFR 1910.178(l)) – Summary & Compliance Guide',
    description: 'Neutral summary of OSHA forklift operator certification and evaluation requirements with official references.',
    datePublished: '2025-10-22',
    dateModified: '2025-10-22',
    author: {
      '@type': 'Organization',
      name: 'Flat Earth Equipment Editorial',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Flat Earth Equipment',
      logo: {
        '@type': 'ImageObject',
        url: 'https://flatearthequipment.com/logo.png',
      },
    },
    mainEntityOfPage: 'https://flatearthequipment.com/insights/osha-forklift-certification-requirements',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/insights" className="hover:text-gray-900 transition-colors">
              Insights
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900">OSHA Forklift Certification</span>
          </nav>

          {/* Article */}
          <article className="prose prose-slate max-w-none bg-white shadow-sm rounded-lg px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              OSHA Forklift Operator Training & Certification (29 CFR 1910.178(l)) – Summary & Compliance Guide
            </h1>
            
            <p className="text-sm text-gray-600 mb-8">
              <strong>Last updated:</strong> October 22, 2025
            </p>

            <p className="lead text-lg text-gray-700">
              OSHA regulates forklift (powered industrial truck) training under{' '}
              <strong>29 CFR 1910.178(l)</strong>. The rule requires employers to develop and 
              implement a training program, evaluate each operator's performance, and{' '}
              <strong>certify</strong> that each operator has been trained and evaluated. Key 
              elements are summarized below with links to the official text.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Overview</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Scope:</strong> All powered industrial truck operators in general industry.
              </li>
              <li>
                <strong>Aim:</strong> Ensure operators are trained, evaluated, and competent to operate safely.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Key OSHA Requirements</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Training & Evaluation:</strong> Employers must train and evaluate operators 
                to ensure safe operation.{' '}
                <a 
                  href="https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.178" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  [OSHA]
                </a>{' '}
                <a 
                  href="https://www.ecfr.gov/current/title-29/part-1910/subpart-N/section-1910.178" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  [eCFR]
                </a>
              </li>
              <li>
                <strong>Program Content:</strong> Training must cover truck-related and 
                workplace-related topics appropriate to the operator and tasks.{' '}
                <a 
                  href="https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.178" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  [OSHA]
                </a>{' '}
                <a 
                  href="https://www.ecfr.gov/current/title-29/part-1910/subpart-N/section-1910.178" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  [eCFR]
                </a>
              </li>
              <li>
                <strong>Refresher Training:</strong> Required after unsafe operation, an 
                incident/near miss, assignment to a different type of truck, or workplace 
                condition changes.{' '}
                <a 
                  href="https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.178" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  [OSHA]
                </a>{' '}
                <a 
                  href="https://www.ecfr.gov/current/title-29/part-1910/subpart-N/section-1910.178" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  [eCFR]
                </a>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Certification & Three-Year Evaluation
            </h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>Three-Year Evaluation:</strong>{' '}
                <em className="text-gray-700">
                  "An evaluation of each powered industrial truck operator's performance shall 
                  be conducted at least once every three years."
                </em>{' '}
                — <strong>29 CFR 1910.178(l)(4)(iii)</strong>.
              </li>
              <li>
                <strong>Certification Record:</strong>{' '}
                <em className="text-gray-700">
                  "The employer shall certify that each operator has been trained and evaluated 
                  as required by this paragraph (l). The certification shall include the name of 
                  the operator, the date of the training, the date of the evaluation, and the 
                  identity of the person(s) performing the training or evaluation."
                </em>{' '}
                — <strong>29 CFR 1910.178(l)(6)</strong>.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Employer Responsibilities (Checklist)
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain a documented training program aligned to 1910.178(l).</li>
              <li>
                Keep certification records (operator name; training date; evaluation date; 
                trainer/evaluator identity).
              </li>
              <li>
                Schedule and complete evaluations <strong>at least every 3 years</strong>, plus 
                refresher training when triggered.
              </li>
              <li>
                Ensure training matches the specific truck type(s) and workplace conditions.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Related Resources</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Forklift training & operator certification →{' '}
                <Link 
                  href="/training/forklift-certification"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  /training/forklift-certification
                </Link>
              </li>
              <li>
                OSHA standard text on OSHA.gov and eCFR.gov (official sources below)
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              References (Official Text)
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>OSHA:</strong> 29 CFR 1910.178 – Powered industrial trucks →{' '}
                <a 
                  href="https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.178" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.178
                </a>
              </li>
              <li>
                <strong>eCFR:</strong> 29 CFR § 1910.178 – Powered industrial trucks →{' '}
                <a 
                  href="https://www.ecfr.gov/current/title-29/part-1910/subpart-N/section-1910.178" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  https://www.ecfr.gov/current/title-29/part-1910/subpart-N/section-1910.178
                </a>
              </li>
            </ul>

            <div className="mt-10 p-4 bg-gray-50 border-l-4 border-gray-400 rounded">
              <p className="text-sm text-gray-700 italic">
                This resource is maintained by Flat Earth Equipment as an educational summary of 
                OSHA forklift certification requirements. It is not legal advice. Always review 
                the official text.
              </p>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

