import { getMarketingDict, type Locale } from '@/i18n';
import ValueGrid from '@/components/marketing/ValueGrid';
import ComplianceBlock from '@/components/marketing/ComplianceBlock';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { detectUserServer } from '@/lib/auth/detectUserServer';
import { safeNext } from '@/lib/auth/nextParam';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // no ISR

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

export default async function SafetyPage() {
  noStore(); // make this request-only; prevents build-time rendering
  const locale = getLocaleForStatic();
  const t = getMarketingDict(locale);
  const { isAuthed, userId } = await detectUserServer();
  
  // Determine CTA destination based on auth + enrollment status
  let ctaHref = `/login?next=${encodeURIComponent('/training/pricing')}`;
  
  if (isAuthed && userId) {
    // Check enrollment status
    const supabase = supabaseServer();
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'forklift')
      .single();
      
    if (course) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', course.id)
        .limit(1)
        .maybeSingle();
        
      ctaHref = enrollment ? '/training' : '/training/pricing';
    } else {
      ctaHref = '/training/pricing'; // No course found, send to pricing
    }
  }
  
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
    <main className="section">
      {/* JSON-LD structured data */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(certificateJsonLd) }} 
      />
      
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <header className="panel shadow-card px-6 py-10 md:px-10 md:py-12 text-center">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wide text-brand-orangeBright/80 mb-2">{t.brand.name}</p>
            <div className="text-xs text-brand-onPanel/70">{t.brand.tagline}</div>
          </div>
          <h1 className="text-display font-semibold mb-4 text-brand-onPanel">
            {t.hero.h1}
          </h1>
          <p className="text-lg text-brand-onPanel/90 prose-readable mx-auto mb-6">
            {t.hero.sub}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Link 
              href="/training" 
              className="btn-primary tappable"
            >
              {t.hero.cta_primary}
            </Link>
            <a 
              href="#how" 
              className="tappable rounded-xl border border-brand-onPanel/20 px-4 py-2 text-brand-onPanel/90 hover:bg-white/5 transition-colors"
            >
              {t.hero.cta_secondary}
            </a>
          </div>
        </header>

        {/* Value Propositions */}
        <div className="mt-8">
          <ValueGrid t={t} />
        </div>

        {/* How It Works */}
        <section id="how" className="mt-8 panel-soft shadow-card px-6 py-6">
          <h2 className="text-2xl font-semibold mb-4 text-brand-onPanel">
            {locale === 'es' ? 'Cómo funciona' : 'How it works'}
          </h2>
          <ol className="list-decimal pl-6 text-base leading-7 text-brand-onPanel/90 space-y-3">
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
        <div className="mt-8">
          <ComplianceBlock t={t} />
        </div>

        {/* FAQ Section */}
        <section className="mt-8 panel-soft shadow-card px-6 py-6">
          <h2 className="text-2xl font-semibold mb-6 text-brand-onPanel">{t.faq.title}</h2>
          <div className="divide-y divide-brand-onPanel/10">
            {t.faq.items.map((f: any, i: number) => (
              <details key={i} className="py-4 group">
                <summary className="cursor-pointer font-medium text-brand-onPanel hover:text-brand-orangeBright transition-colors list-none tappable">
                  <div className="flex items-center justify-between">
                    <span className="text-base leading-7">{f.q}</span>
                    <span className="text-brand-onPanel/60 group-open:rotate-180 transition-transform ml-2">
                      ▼
                    </span>
                  </div>
                </summary>
                <p className="text-base leading-7 text-brand-onPanel/90 mt-3 prose-readable">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-10 rounded-2xl bg-brand-orange text-white px-6 py-8 text-center shadow-card">
          <h2 className="text-2xl font-semibold mb-2">
            {locale === 'es' ? 'Comience hoy' : 'Get started today'}
          </h2>
          <p className="prose-readable mx-auto opacity-95 text-lg leading-7 mb-5">
            {locale === 'es' 
              ? 'Capacitación interactiva que cumple con OSHA. Sin videos largos.'
              : 'Interactive training that meets OSHA requirements. No long videos.'
            }
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link 
              href={ctaHref}
              className="btn-primary tappable" 
              style={{ ['--btn-bg' as any]: '#F76511' }}
              aria-label="Get started with training"
              data-testid="get-started-cta"
            >
              {t.cta.start_training}
            </Link>
            <p className="mt-3 text-sm text-white/80">
              Have a code? <a href="/redeem" className="underline hover:text-white">Redeem</a>
            </p>
            <Link 
              href="/quote" 
              className="tappable rounded-xl bg-white/10 px-4 py-2 text-white hover:bg-white/15 transition-colors"
            >
              {t.cta.buy_now}
            </Link>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="mt-8 text-center text-sm text-brand-inkMuted">
          <p className="prose-readable mx-auto">
            {locale === 'es' 
              ? 'Cumple con los requisitos de OSHA 29 CFR 1910.178 para capacitación formal de operadores.'
              : 'Meets OSHA 29 CFR 1910.178 requirements for formal operator training.'
            }
          </p>
        </footer>
      </div>
    </main>
  );
}