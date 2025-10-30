import { getMarketingDict, type Locale } from '@/i18n';
import ValueGrid from '@/components/marketing/ValueGrid';
import ComplianceBlock from '@/components/marketing/ComplianceBlock';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { detectUserServer } from '@/lib/auth/detectUserServer';
import { safeNext } from '@/lib/auth/nextParam';
import { supabaseServer } from '@/lib/supabase/server';
import PricingStrip from '@/components/training/PricingStrip';
import SafetyHero from '@/components/safety/SafetyHero';
import StickyCTA from '@/components/safety/StickyCTA';
import ReasonsToJoin from '@/components/ReasonsToJoin';
import HowItWorksStrip from '@/components/HowItWorksStrip';
import SafetyScreenshots from './components/SafetyScreenshots';

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
  
  // Feature flag for screenshot section (additive, safe to toggle)
  const showScreenshots = true;
  
  // Determine CTA destination based on auth + enrollment status
  // For non-authenticated users, direct to pricing (better for ads)
  // For authenticated users, check enrollment and route accordingly
  let ctaHref = '/safety#pricing';
  let ctaText = locale === 'es' ? 'Certificarse Ahora - $59' : 'Get Certified Now - $59';
  
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
        
      if (enrollment) {
        ctaHref = '/training';
        ctaText = locale === 'es' ? 'Continuar Entrenamiento' : 'Continue Training';
      } else {
        ctaHref = '/safety#pricing';
        ctaText = locale === 'es' ? 'Certificarse Ahora - $59' : 'Get Certified Now - $59';
      }
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
    audience: {
      '@type': 'BusinessAudience',
      name: 'Ports & Terminals (Yard Operations)'
    },
    about: [
      {
        '@type': 'Thing',
        name: 'OSHA forklift certification online'
      },
      {
        '@type': 'Thing',
        name: 'Port and terminal forklift operations'
      }
    ],
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

  // Demo Video JSON-LD
  const demoVideoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'Forklift Certification — 20-second Demo',
    description: 'Quick overview of our OSHA-compliant forklift training platform',
    thumbnailUrl: 'https://flatearthequipment.com/media/demo/poster.jpg',
    uploadDate: '2025-10-22',
    contentUrl: 'https://flatearthequipment.com/media/demo/hero-demo.mp4',
    embedUrl: 'https://flatearthequipment.com/safety',
    duration: 'PT20S'
  };

  return (
    <>
      {/* JSON-LD structured data */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(certificateJsonLd) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(demoVideoJsonLd) }} 
      />
      
      {/* New Simplified Hero */}
      <SafetyHero />
      
      <main className="section">
      <div className="container mx-auto px-4">
        {/* Already certified? Login link */}
        {!isAuthed && (
          <div className="text-center py-4">
            <p className="text-sm text-slate-600">
              {locale === 'es' ? '¿Ya estás certificado? ' : 'Already certified? '}
              <Link href="/login" className="text-[#F76511] hover:text-orange-600 underline font-medium">
                {locale === 'es' ? 'Inicia sesión aquí' : 'Login here'}
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Visual proof section (additive, safe) */}
      {showScreenshots && <SafetyScreenshots />}

      <div className="container mx-auto px-4">
        {/* Comparison - Mobile-First Card Design */}
        <section className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 mb-6">
            Why Choose Online Training?
          </h2>
          
          {/* Mobile: Stacked comparison cards */}
          <div className="space-y-4 sm:hidden">
            {[
              { icon: '⏰', label: 'Time', old: '8 hours', new: 'Under 60 min' },
              { icon: '💵', label: 'Cost', old: '$200-$500', new: '$59' },
              { icon: '📍', label: 'Location', old: 'Travel required', new: 'Anywhere' },
              { icon: '📜', label: 'Certificate', old: '1-2 weeks', new: 'Instant' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Classroom</div>
                    <div className="font-medium text-slate-700">{item.old}</div>
                  </div>
                  <div className="border-l-2 border-[#F76511] pl-3">
                    <div className="text-xs text-[#F76511] font-semibold mb-1">Online</div>
                    <div className="font-bold text-[#F76511]">{item.new}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table view */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-blue-300">
                  <th className="pb-3 text-slate-700 font-semibold"></th>
                  <th className="pb-3 text-slate-700 font-semibold">Traditional Classroom</th>
                  <th className="pb-3 text-[#F76511] font-bold">Flat Earth Safety Online</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-blue-100">
                  <td className="py-3 font-medium text-slate-700">⏰ Time Required</td>
                  <td className="py-3 text-slate-600">8 hours (full day)</td>
                  <td className="py-3 text-[#F76511] font-semibold">Under 60 minutes ⚡</td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="py-3 font-medium text-slate-700">💵 Cost</td>
                  <td className="py-3 text-slate-600">$200-$500</td>
                  <td className="py-3 text-[#F76511] font-semibold">$59</td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="py-3 font-medium text-slate-700">📍 Location</td>
                  <td className="py-3 text-slate-600">Must travel to center</td>
                  <td className="py-3 text-[#F76511] font-semibold">Train anywhere</td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="py-3 font-medium text-slate-700">📅 Schedule</td>
                  <td className="py-3 text-slate-600">Fixed class times</td>
                  <td className="py-3 text-[#F76511] font-semibold">24/7 - Start now</td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="py-3 font-medium text-slate-700">📜 Certificate</td>
                  <td className="py-3 text-slate-600">Mail in 1-2 weeks</td>
                  <td className="py-3 text-[#F76511] font-semibold">Instant download</td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="py-3 font-medium text-slate-700">✅ OSHA Compliance</td>
                  <td className="py-3 text-slate-600">29 CFR 1910.178</td>
                  <td className="py-3 text-[#F76511] font-semibold">29 CFR 1910.178</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-slate-700">🔄 Retakes</td>
                  <td className="py-3 text-slate-600">Pay again</td>
                  <td className="py-3 text-[#F76511] font-semibold">Free unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 text-center p-4 bg-white rounded-xl border border-blue-200">
            <p className="text-base sm:text-lg font-bold text-slate-900">
              💰 You save: $141-$441 + 7 hours
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Same OSHA certification. Faster and more convenient.
            </p>
          </div>
        </section>

        {/* Authority & Compliance Section */}
        <section className="mt-8 grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border-2 border-green-200 p-6 text-center shadow-sm">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-bold text-slate-900 mb-2">OSHA 29 CFR 1910.178</h3>
            <p className="text-sm text-slate-600">
              Meets all required formal instruction topics for powered industrial trucks
            </p>
          </div>
          <div className="bg-white rounded-xl border-2 border-blue-200 p-6 text-center shadow-sm">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="font-bold text-slate-900 mb-2">Accepted in All 50 States</h3>
            <p className="text-sm text-slate-600">
              Valid nationwide. Recognized by employers across the United States
            </p>
          </div>
          <div className="bg-white rounded-xl border-2 border-orange-200 p-6 text-center shadow-sm">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-bold text-slate-900 mb-2">Instant Verification</h3>
            <p className="text-sm text-slate-600">
              QR code on certificate allows instant verification by employers
            </p>
          </div>
        </section>

        {/* Reasons to Join */}
        <ReasonsToJoin />

        {/* How It Works */}
        <div id="how" className="scroll-mt-24">
          <HowItWorksStrip />
        </div>

        {/* Urgency Element */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 text-center">
          <p className="text-lg font-bold text-slate-900 mb-2">
            🚀 Start Today, Get Certified Today
          </p>
          <p className="text-sm text-slate-700">
            Complete your training in under an hour and download your certificate immediately. Don't wait for scheduled classes - get job-ready now.
          </p>
        </div>

        <PricingStrip />

        {/* Value Propositions */}
        <div className="mt-8">
          <ValueGrid t={t} />
        </div>

        {/* Compliance Block */}
        <div className="mt-8">
          <ComplianceBlock t={t} />
        </div>

        {/* Ports & Terminals Section */}
        <section id="ports" className="mt-8 scroll-mt-24 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Ports & Terminals: Forklift Training for Throughput</h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            Container yards have unique risks—blue-light pedestrian lanes, blind corners in container mazes,
            wind and stack-height limits, uneven surfaces, and tight approaches. Our OSHA forklift certification
            pairs a fast, online theory module (≈90 minutes, English & Spanish) with your on-yard practical
            evaluation so operators earn same-day wallet cards and you keep lanes moving.
          </p>
          <ul className="mt-4 space-y-2 text-slate-700 list-disc pl-5">
            <li>Standardize theory online; finish practical on your yard & truck classes.</li>
            <li>Spotter hand signals, horn-at-corners, and blue-light lane rules built into evaluation.</li>
            <li>Simple records for audits; 3-year renewal reminders; retrain after incidents or equipment changes.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link 
              href="/safety/forklift" 
              className="inline-flex items-center gap-2 bg-[#F76511] text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
            >
              {locale === 'es' ? 'Comenzar Curso – $59' : 'Start Course – $59'}
            </Link>
            <Link 
              href="#pricing" 
              className="inline-flex items-center gap-2 bg-white text-[#F76511] border-2 border-[#F76511] px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
            >
              {locale === 'es' ? 'Paquetes para Empleadores' : 'Crew Packs for Employers'}
            </Link>
            <a 
              href={locale === 'es' ? '/docs/evaluacion-practica-montacargas.pdf' : '/docs/forklift-employer-eval.pdf'}
              className="inline-flex items-center gap-2 text-slate-700 hover:text-[#F76511] underline font-medium px-3 py-3 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {locale === 'es' ? 'Evaluación Práctica del Empleador (PDF)' : 'Employer Practical Evaluation (PDF)'}
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">{t.faq.title}</h2>
          <div className="divide-y divide-slate-200">
            {t.faq.items.map((f: any, i: number) => (
              <details key={i} className="py-5 group">
                <summary className="cursor-pointer font-semibold text-slate-900 hover:text-[#F76511] transition-colors list-none tappable">
                  <div className="flex items-center justify-between">
                    <span className="text-base leading-7">{f.q}</span>
                    <span className="text-slate-500 group-open:rotate-180 transition-transform ml-2">
                      ▼
                    </span>
                  </div>
                </summary>
                <p className="text-base leading-7 text-slate-700 mt-3">
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
              href="/safety#pricing"
              className="inline-flex items-center gap-2 bg-white text-[#F76511] px-8 py-4 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg hover:shadow-xl" 
              aria-label="View pricing and buy training"
              data-testid="get-started-cta"
            >
              {locale === 'es' ? 'Ver Precios' : 'View Pricing'} →
            </Link>
            <a 
              href="#how-it-works" 
              className="tappable rounded-xl bg-white/10 px-4 py-2 text-white hover:bg-white/15 transition-colors"
            >
              {locale === 'es' ? 'Cómo funciona' : 'How it works'}
            </a>
          </div>
          <p className="mt-3 text-sm text-white/80">
            {locale === 'es' ? '¿Tienes un código? ' : 'Have a code? '}
            <a href="/redeem" className="underline hover:text-white">
              {locale === 'es' ? 'Canjear' : 'Redeem'}
            </a>
            {' • '}
            {locale === 'es' ? '¿Ya estás certificado? ' : 'Already certified? '}
            <a href="/login" className="underline hover:text-white">
              {locale === 'es' ? 'Inicia sesión' : 'Login'}
            </a>
          </p>
        </section>

        {/* Browse by State - Internal Linking */}
        <section className="mt-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border-2 border-orange-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">
              {locale === 'es' ? 'Certificación por Estado' : 'Forklift Certification by State'}
            </h2>
            <p className="text-slate-700 max-w-2xl mx-auto mb-4">
              {locale === 'es' 
                ? 'Obtenga información específica del estado sobre requisitos de OSHA, multas y certificación. Nuestra capacitación es aceptada en los 50 estados.'
                : 'Get state-specific information about OSHA requirements, penalties, and certification. Our training is accepted in all 50 states.'
              }
            </p>
            
            {locale === 'en' && (
              <p className="text-sm text-slate-600 max-w-2xl mx-auto mb-6">
                Working near ports? See our <a href="#ports" className="text-[#F76511] hover:text-orange-600 underline font-medium">Ports & Terminals guidance</a>.
              </p>
            )}
            
            {/* Quick Links to Popular States */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6 max-w-4xl mx-auto">
              {[
                { code: 'tx', name: 'Texas', icon: '🤠' },
                { code: 'ca', name: 'California', icon: '☀️' },
                { code: 'fl', name: 'Florida', icon: '🌴' },
                { code: 'ny', name: 'New York', icon: '🗽' },
                { code: 'pa', name: 'Pennsylvania', icon: '🏛️' },
                { code: 'oh', name: 'Ohio', icon: '🏭' },
                { code: 'il', name: 'Illinois', icon: '🌆' },
                { code: 'nc', name: 'North Carolina', icon: '🌲' },
                { code: 'ga', name: 'Georgia', icon: '🍑' },
                { code: 'mi', name: 'Michigan', icon: '🚗' },
              ].map(state => (
                <Link
                  key={state.code}
                  href={`/safety/forklift/${state.code}`}
                  className="bg-white hover:bg-orange-50 border border-orange-200 rounded-lg p-3 transition-all hover:shadow-md"
                >
                  <div className="text-2xl mb-1">{state.icon}</div>
                  <div className="text-sm font-medium text-slate-800">{state.name}</div>
                </Link>
              ))}
            </div>
            
            <Link 
              href="/safety/forklift" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F76511] to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              {locale === 'es' ? 'Ver los 50 Estados →' : 'Browse All 50 States →'}
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
    
    {/* Mobile Sticky CTA */}
    <StickyCTA />
  </>
  );
}