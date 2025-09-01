import { getMarketingDict, type Locale } from '@/i18n';
import ValueGrid from '@/components/marketing/ValueGrid';
import ComplianceBlock from '@/components/marketing/ComplianceBlock';
import Link from 'next/link';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata = {
  title: 'Forklift Operator Training — Flat Earth Safety',
  description: 'Interactive forklift certification training with demos, micro-quizzes, final exam, and QR-verifiable certificates. OSHA 29 CFR 1910.178(l) aligned.',
  keywords: 'forklift training, forklift certification, OSHA compliance, forklift operator, industrial truck training, workplace safety',
  openGraph: {
    title: 'Forklift Operator Training — Flat Earth Safety',
    description: 'Interactive training, modern UI, real records. OSHA-compliant forklift certification with hands-on demos.',
    type: 'website',
    url: '/safety',
    siteName: 'Flat Earth Safety',
    images: [
      {
        url: '/og-forklift-training.jpg',
        width: 1200,
        height: 630,
        alt: 'Flat Earth Safety Forklift Training Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forklift Operator Training — Flat Earth Safety',
    description: 'Interactive OSHA-compliant forklift certification with modern demos and QR-verifiable certificates.',
    images: ['/og-forklift-training.jpg']
  },
  alternates: {
    canonical: '/safety'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

function getLocaleForStatic(): Locale {
  // For static generation, use default locale
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
  return ['en', 'es'].includes(defaultLocale) ? defaultLocale as Locale : 'en';
}

export default function SafetyPage() {
  const locale = getLocaleForStatic();
  const t = getMarketingDict(locale);
  
  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${t.brand.name} — Forklift Operator Training`,
    description: t.hero.sub,
    provider: { 
      '@type': 'Organization', 
      name: t.brand.name,
      url: 'https://flatearthequipment.com'
    },
    educationalLevel: 'Professional',
    teaches: [
      'Forklift operation safety',
      'OSHA compliance requirements',
      'Pre-operation inspection',
      'Load handling and stability',
      'Hazard identification'
    ],
    courseMode: 'online',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      instructor: {
        '@type': 'Organization',
        name: t.brand.name
      }
    }
  };

  // Certificate JSON-LD
  const certificateJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: 'Forklift Operator Certificate',
    description: 'OSHA-compliant forklift operator certification',
    credentialCategory: 'certificate',
    recognizedBy: {
      '@type': 'Organization',
      name: 'Occupational Safety and Health Administration (OSHA)'
    },
    validFor: 'P3Y' // 3 years
  };

  return (
    <main className="container mx-auto p-4 space-y-6 max-w-4xl">
      {/* JSON-LD structured data */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(certificateJsonLd) }} 
      />
      
      {/* Hero Section */}
      <header className="rounded-2xl border p-6 bg-white dark:bg-slate-900 text-center">
        <div className="mb-3">
          <div className="text-sm font-medium text-[#F76511] mb-1">{t.brand.name}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">{t.brand.tagline}</div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white mb-3">
          {t.hero.h1}
        </h1>
        <p className="text-slate-700 dark:text-slate-300 mt-2 max-w-2xl mx-auto mb-4">
          {t.hero.sub}
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Link 
            href="/training" 
            className="rounded-2xl bg-[#F76511] text-white px-6 py-3 shadow-lg hover:bg-[#E55A0C] transition-colors font-semibold"
          >
            {t.hero.cta_primary}
          </Link>
          <a 
            href="#how" 
            className="rounded-2xl border border-slate-300 dark:border-slate-600 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {t.hero.cta_secondary}
          </a>
        </div>
      </header>

      {/* Value Propositions */}
      <ValueGrid t={t} />

      {/* How It Works */}
      <section id="how" className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
        <h2 className="text-xl font-bold mb-3">
          {locale === 'es' ? 'Cómo funciona' : 'How it works'}
        </h2>
        <ol className="mt-2 list-decimal pl-5 text-sm space-y-2">
          <li>
            {locale === 'es' 
              ? 'Aprenda con demos interactivas cortas (puntos activos, listas de verificación, simulaciones).'
              : 'Learn with short interactive demos (hotspots, checklists, simulations).'
            }
          </li>
          <li>
            {locale === 'es' 
              ? 'Responda micro-cuestionarios de 3-7 preguntas para consolidar conceptos.'
              : 'Answer 3–7 question micro-quizzes to lock in concepts.'
            }
          </li>
          <li>
            {locale === 'es' 
              ? 'Apruebe el examen final para generar su certificado.'
              : 'Pass the final exam to generate your certificate.'
            }
          </li>
          <li>
            {locale === 'es' 
              ? 'Su supervisor completa la evaluación práctica y firma en el sitio.'
              : 'Your supervisor completes the practical evaluation and signature on site.'
            }
          </li>
        </ol>
      </section>

      {/* Compliance Block */}
      <ComplianceBlock t={t} />

      {/* FAQ Section */}
      <section className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
        <h2 className="text-xl font-bold mb-4">{t.faq.title}</h2>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {t.faq.items.map((f: any, i: number) => (
            <details key={i} className="py-3 group">
              <summary className="cursor-pointer font-medium text-slate-900 dark:text-slate-100 hover:text-[#F76511] transition-colors list-none">
                <div className="flex items-center justify-between">
                  <span>{f.q}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </div>
              </summary>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="rounded-2xl border p-6 bg-gradient-to-r from-[#F76511] to-[#E55A0C] text-white text-center">
        <h2 className="text-xl font-bold mb-2">
          {locale === 'es' ? 'Comience hoy' : 'Get started today'}
        </h2>
        <p className="text-orange-100 mb-4">
          {locale === 'es' 
            ? 'Capacitación interactiva que cumple con OSHA. Sin videos largos.'
            : 'Interactive training that meets OSHA requirements. No long videos.'
          }
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link 
            href="/training" 
            className="rounded-2xl bg-white text-[#F76511] px-6 py-3 font-semibold hover:bg-orange-50 transition-colors"
          >
            {t.cta.start_training}
          </Link>
          <Link 
            href="/quote" 
            className="rounded-2xl border border-orange-300 text-white px-6 py-3 hover:bg-orange-600 transition-colors"
          >
            {t.cta.buy_now}
          </Link>
        </div>
      </section>

      {/* Footer Note */}
      <footer className="text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          {locale === 'es' 
            ? 'Cumple con los requisitos de OSHA 29 CFR 1910.178 para capacitación formal de operadores.'
            : 'Meets OSHA 29 CFR 1910.178 requirements for formal operator training.'
          }
        </p>
      </footer>
    </main>
  );
}