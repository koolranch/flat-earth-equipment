import { Suspense } from 'react';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { detectUserServer } from '@/lib/auth/detectUserServer';
import { supabaseServer } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import { getMarketingDict } from '@/i18n';
import ComplianceBlock from '@/components/marketing/ComplianceBlock';
import PricingStrip from '@/components/training/PricingStrip';
import SafetyHero from '@/components/safety/SafetyHero';
import StatePersonalizedHero from '@/components/safety/StatePersonalizedHero';
import LogoCloud from '@/components/safety/LogoCloud';
import StickyCTA from '@/components/safety/StickyCTA';
import FaqAccordion from '@/components/safety/FaqAccordion';
import SafetyStateLinks from '@/components/safety/SafetyStateLinks';
import ReasonsToJoin from '@/components/ReasonsToJoin';
import HowItWorksStrip from '@/components/HowItWorksStrip';
import SafetyScreenshots from './components/SafetyScreenshots';
import Testimonial from './components/Testimonial';
import FaqSchema from './components/FaqSchema';
import type { SafetyTrafficSource } from '@/lib/safety/traffic-source';

export default async function SafetyLandingPage({
  locale,
  trafficSource = 'organic',
}: {
  locale: Locale;
  trafficSource?: SafetyTrafficSource;
}) {
  noStore();
  const t = getMarketingDict(locale);
  const { isAuthed, userId } = await detectUserServer();
  const showScreenshots = true;

  if (isAuthed && userId) {
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

      // Enrollment lookup keeps the previous request-time behavior for
      // authenticated visitors; the app-first CTAs below remain the primary
      // conversion path for ad traffic.
      void enrollment;
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: t.safety.jsonLd.courseName,
    description: t.safety.jsonLd.courseDescription,
    inLanguage: t.safety.jsonLd.inLanguage,
    provider: {
      '@type': 'Organization',
      name: t.brand.name,
      url: 'https://www.flatearthequipment.com',
    },
    educationalLevel: 'Professional',
    teaches: t.safety.jsonLd.teaches,
    courseMode: 'online',
    timeRequired: 'PT30M',
    audience: {
      '@type': 'Audience',
      audienceType: t.safety.jsonLd.audienceType,
    },
    about: [
      { '@type': 'Thing', name: t.safety.jsonLd.aboutOnline },
      { '@type': 'Thing', name: t.safety.jsonLd.aboutOsha },
    ],
    offers: {
      '@type': 'Offer',
      price: 49,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `https://www.flatearthequipment.com${locale === 'es' ? '/es/safety' : '/safety'}#pricing`,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      inLanguage: t.safety.jsonLd.inLanguage,
      courseSchedule: {
        '@type': 'Schedule',
        repeatFrequency: 'P1D',
      },
      instructor: {
        '@type': 'Organization',
        name: t.brand.name,
      },
    },
  };

  const certificateJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: t.safety.jsonLd.credentialName,
    description: t.safety.jsonLd.credentialDescription,
    inLanguage: t.safety.jsonLd.inLanguage,
    credentialCategory: 'certificate',
    recognizedBy: {
      '@type': 'Organization',
      name: 'Occupational Safety and Health Administration (OSHA)',
    },
    validFor: 'P3Y',
  };

  const demoVideoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: t.safety.jsonLd.videoName,
    description: t.safety.jsonLd.videoDescription,
    inLanguage: t.safety.jsonLd.inLanguage,
    thumbnailUrl: 'https://www.flatearthequipment.com/media/demo/poster.jpg',
    uploadDate: '2025-10-22',
    contentUrl: 'https://www.flatearthequipment.com/media/demo/hero-demo.mp4',
    embedUrl: `https://www.flatearthequipment.com${locale === 'es' ? '/es/safety' : '/safety'}`,
    duration: 'PT20S',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(certificateJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(demoVideoJsonLd) }} />

      <Suspense fallback={<SafetyHero locale={locale} t={t} trafficSource={trafficSource} />}>
        <StatePersonalizedHero locale={locale} t={t} trafficSource={trafficSource} />
      </Suspense>

      <LogoCloud t={t} />

      <main className="section">
        {showScreenshots && <SafetyScreenshots t={t} locale={locale} />}

        <div className="container mx-auto px-4">
          {!isAuthed && (
            <div className="hidden md:block text-center py-2">
              <p className="text-sm text-slate-600">
                {t.safety.login.prompt}{' '}
                <Link href="/login" className="text-[#F76511] hover:text-orange-600 underline font-medium">
                  {t.safety.login.link}
                </Link>
              </p>
            </div>
          )}

          <section className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 mb-6">
              {t.safety.comparison.title}
            </h2>

            <div className="space-y-4 sm:hidden">
              {t.safety.comparison.rows.slice(0, 5).map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">{t.safety.comparison.classroom}</div>
                      <div className="font-medium text-slate-700">{item.old}</div>
                    </div>
                    <div className="border-l-2 border-[#F76511] pl-3">
                      <div className="text-xs text-[#F76511] font-semibold mb-1">{t.safety.comparison.online}</div>
                      <div className="font-bold text-[#F76511]">{item.new}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-blue-300">
                    <th className="pb-3 text-slate-700 font-semibold"></th>
                    <th className="pb-3 text-slate-700 font-semibold">{t.safety.comparison.classroomDesktop}</th>
                    <th className="pb-3 text-[#F76511] font-bold">{t.safety.comparison.online}</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {t.safety.comparison.rows.map((item, index) => (
                    <tr key={item.desktopLabel} className={index < t.safety.comparison.rows.length - 1 ? 'border-b border-blue-100' : ''}>
                      <td className="py-3 font-medium text-slate-700">{item.icon} {item.desktopLabel}</td>
                      <td className="py-3 text-slate-600">{item.desktopOld}</td>
                      <td className="py-3 text-[#F76511] font-semibold">{item.desktopNew}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center p-4 bg-white rounded-xl border border-blue-200">
              <p className="text-base sm:text-lg font-bold text-slate-900">{t.safety.comparison.savings}</p>
              <p className="text-sm text-slate-600 mt-1">{t.safety.comparison.same}</p>
            </div>
          </section>

          <PricingStrip locale={locale} t={t} />
        </div>

        <Testimonial t={t} />

        <div className="container mx-auto px-4">
          <div id="how" className="scroll-mt-24">
            <HowItWorksStrip t={t} />
          </div>

          <section className="mt-8 grid sm:grid-cols-3 gap-4">
            {t.safety.authority.map((card, index) => (
              <div
                key={card.title}
                className={`bg-white rounded-xl border-2 p-6 text-center shadow-sm ${
                  index === 0 ? 'border-green-200' : index === 1 ? 'border-blue-200' : 'border-orange-200'
                }`}
              >
                <div className="text-4xl mb-3">{index === 0 ? '📋' : index === 1 ? '🗺️' : '✅'}</div>
                <h3 className="font-bold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600">{card.body}</p>
              </div>
            ))}
          </section>

          <ReasonsToJoin t={t} />

          <div className="mt-8">
            <ComplianceBlock t={t} />
          </div>

          <section id="ports" className="hidden md:block mt-8 scroll-mt-24 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t.safety.ports.title}</h2>
            <p className="text-lg text-slate-700 leading-relaxed">{t.safety.ports.body}</p>
            <ul className="mt-4 space-y-2 text-slate-700 list-disc pl-5">
              {t.safety.ports.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={locale === 'es' ? '/es/safety#pricing' : '/safety/forklift'}
                className="inline-flex items-center gap-2 bg-[#F76511] text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
              >
                {t.safety.ports.start}
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 bg-white text-[#F76511] border-2 border-[#F76511] px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
              >
                {t.safety.ports.packs}
              </Link>
              <a
                href={locale === 'es' ? '/docs/evaluacion-practica-montacargas.pdf' : '/docs/forklift-employer-eval.pdf'}
                className="inline-flex items-center gap-2 text-slate-700 hover:text-[#F76511] underline font-medium px-3 py-3 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.safety.ports.pdf}
              </a>
            </div>
          </section>

          <FaqAccordion
            items={t.faq.items}
            title={t.safety.faqUi.title}
            showMoreLabel={t.safety.faqUi.showMore}
            showLessLabel={t.safety.faqUi.showLess}
            paymentMethodsLabel={t.safety.faqUi.paymentMethods}
            guaranteeLabel={t.safety.faqUi.guarantee}
          />

          <section className="mt-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border-2 border-orange-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">{t.safety.stateSection.title}</h2>
              <p className="text-slate-700 max-w-2xl mx-auto mb-4">{t.safety.stateSection.body}</p>

              {locale === 'en' && (
                <p className="text-sm text-slate-600 max-w-2xl mx-auto mb-6">
                  {t.safety.ports.guidance}{' '}
                  <a href="#ports" className="text-[#F76511] hover:text-orange-600 underline font-medium">
                    {t.safety.ports.guidanceLink}
                  </a>.
                </p>
              )}

              <Suspense fallback={null}>
                <SafetyStateLinks locale={locale} />
              </Suspense>

              <Link
                href={locale === 'es' ? '/es/safety' : '/safety/forklift'}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F76511] to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                {t.safety.stateSection.browse}
              </Link>
            </div>
          </section>

          <footer className="mt-8 text-center text-sm text-brand-inkMuted">
            <p className="prose-readable mx-auto">{t.safety.footerNote}</p>
          </footer>
        </div>

        <FaqSchema t={t} />
      </main>

      <StickyCTA locale={locale} t={t} trafficSource={trafficSource} />
    </>
  );
}
