'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PLANS } from '@/lib/training/plans';
import { createTrainingCheckoutSessionFromForm } from '@/app/training/checkout/actions';
import Link from 'next/link';
import AppDownloadCTA from '@/components/safety/AppDownloadCTA';
import ClickIdsHiddenInput from '@/components/checkout/ClickIdsHiddenInput';
import { trackWebCheckoutInitiated } from '@/lib/analytics/gtag';
import type { Locale, MarketingDict } from '@/i18n';
import { getMarketingDict } from '@/i18n';

function ReferralHiddenInput() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  if (!ref) return null;
  return <input type="hidden" name="referralCode" value={ref} />;
}

/**
 * When NEXT_PUBLIC_ENABLE_ASK_EMPLOYER_CHECKOUT is '1', forward
 * request_id and prefill_email from the URL into the server-action form
 * so they reach /api/checkout via createTrainingCheckoutSessionFromForm.
 * No-op when either the flag is off or the params are absent.
 */
function RequestParamsHiddenInputs() {
  const searchParams = useSearchParams();
  if (process.env.NEXT_PUBLIC_ENABLE_ASK_EMPLOYER_CHECKOUT !== '1') return null;
  const requestId = searchParams.get('request_id');
  const prefillEmail = searchParams.get('prefill_email');
  return (
    <>
      {requestId && <input type="hidden" name="requestId" value={requestId} />}
      {prefillEmail && <input type="hidden" name="prefillEmail" value={prefillEmail} />}
    </>
  );
}

function BillingLabel({ label }: { label?: string }) {
  if (!label) return null;

  return <span className="ml-2 text-lg font-semibold text-slate-500">{label}</span>;
}

export default function PricingStrip({
  disableBuy = false,
  locale = 'en',
  t,
}: {
  disableBuy?: boolean;
  locale?: Locale;
  t?: MarketingDict;
}) {
  const dict = t || getMarketingDict(locale);
  const copy = dict.safety.pricing;
  const [showTeamPricing, setShowTeamPricing] = useState(false);
  
  const singlePlan = PLANS[0]; // Single Operator plan
  const teamPlans = PLANS.slice(1); // 5-Pack, 25-Pack, Unlimited

  return (
    <section id="pricing" className="mt-8 mx-auto max-w-6xl px-4">
      <h2 className="text-3xl font-bold text-center text-slate-900">{copy.title}</h2>
      <p className="text-center text-base text-slate-600 mt-2">{copy.subtitle}</p>
      <p className="text-center text-sm text-slate-600 mt-1">{copy.teamNote}</p>
      <p className="text-center text-xs text-emerald-600 font-medium mt-2">✨ {copy.accessNote}</p>
      
      {/* Desktop: Show all 4 plans in grid */}
      <div className="hidden md:grid mt-8 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => (
          <div 
            key={p.key} 
            className={`relative border-2 rounded-2xl p-6 flex flex-col justify-between bg-white shadow-md hover:shadow-xl transition-all ${
              p.popular ? 'border-[#F76511] ring-2 ring-orange-100' : 'border-slate-200'
            }`}
          >
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#F76511] text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                  {copy.popular}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-slate-900">{copy.planTitles[p.key as keyof typeof copy.planTitles] || p.title}</h3>
              <div className="mt-3 flex items-end text-[#F76511]">
                <span className="text-4xl font-bold">{p.priceText}</span>
                <BillingLabel label={p.billingLabel === '/year' ? copy.billingLabels.year : p.billingLabel} />
              </div>
              <p className="text-sm text-slate-600 mt-2">{copy.planBlurbs[p.key as keyof typeof copy.planBlurbs] || p.blurb}</p>
              {p.callout && (
                <p className="text-xs text-emerald-600 font-semibold mt-1">{copy.planCallouts[p.key as keyof typeof copy.planCallouts] || p.callout}</p>
              )}
            </div>
            {disableBuy ? (
              <Link 
                href={locale === 'es' ? '/es/safety#pricing' : '/safety#pricing'}
                className="mt-6 w-full text-center px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors" 
                data-testid={`safety-see-${p.key}`}
              >
                {copy.seeOnPricing}
              </Link>
            ) : p.priceId ? (
              <form action={createTrainingCheckoutSessionFromForm} className="mt-6">
                <input type="hidden" name="priceId" value={p.priceId} />
                <Suspense><ReferralHiddenInput /></Suspense>
                <Suspense><RequestParamsHiddenInputs /></Suspense>
                <ClickIdsHiddenInput />
                <button 
                  type="submit" 
                  className={`w-full px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg ${
                    p.popular 
                      ? 'bg-[#F76511] text-white hover:bg-orange-600' 
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                  data-testid={`safety-top-buy-${p.key}`}
                >
                  {copy.buyNow}
                </button>
              </form>
            ) : (
              <Link
                href="/contact"
                className="mt-6 w-full text-center px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                data-testid={`safety-top-contact-${p.key}`}
              >
                {copy.contact}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: App-first single-operator card + team pricing accordion */}
      <div className="md:hidden mt-8 space-y-4">
        <div
          key={singlePlan.key}
          className="relative border-2 rounded-2xl p-6 flex flex-col gap-5 bg-white shadow-md border-[#F76511] ring-2 ring-orange-100"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-[#F76511] text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
              {copy.singleBadge}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">{copy.singleTitle}</h3>
            <p className="text-sm text-slate-600 mt-2">
              {copy.singleBody}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              💼 {copy.employerPay}
            </p>
          </div>

          {disableBuy ? (
            <Link
              href={locale === 'es' ? '/es/safety#pricing' : '/safety#pricing'}
              className="mt-2 w-full text-center px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              data-testid={`safety-see-${singlePlan.key}`}
            >
              {copy.seeOnPricing}
            </Link>
          ) : (
            <div className="flex flex-col gap-4">
              {/* PRIMARY: web Stripe checkout (full-margin, best-converting path) */}
              <form action={createTrainingCheckoutSessionFromForm}>
                <input type="hidden" name="priceId" value={singlePlan.priceId} />
                <Suspense><ReferralHiddenInput /></Suspense>
                <Suspense><RequestParamsHiddenInputs /></Suspense>
                <ClickIdsHiddenInput />
                <button
                  type="submit"
                  onClick={() => {
                    trackWebCheckoutInitiated({
                      source: 'safety_pricing_web',
                      priceId: singlePlan.priceId,
                      value: singlePlan.price,
                    });
                  }}
                  className="w-full px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg bg-[#F76511] text-white hover:bg-orange-600"
                  data-testid={`safety-top-buy-${singlePlan.key}`}
                >
                  {copy.buyNowWeb}
                </button>
              </form>

              {/* SECONDARY: study free in the app, then pay $49 at the exam */}
              <div className="flex flex-col items-center gap-2 border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-500">
                  {dict.safety.appDownload.studyFirstEyebrow}
                </p>
                <AppDownloadCTA
                  placement={locale === 'es' ? 'safety_pricing_es' : 'safety_pricing'}
                  primaryLabel={dict.safety.appDownload.pricingPrimaryLabel}
                  showPrimaryButton={false}
                  showWebFallback={false}
                  showTrustLine={false}
                  className="items-center"
                  locale={locale}
                  t={dict}
                />
              </div>
            </div>
          )}
        </div>

        {/* Team Pricing Accordion */}
        <div className="text-center">
          <button
            onClick={() => setShowTeamPricing(!showTeamPricing)}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-[#F76511] font-medium px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <span>{copy.employerPlans}</span>
            <span className={`transition-transform ${showTeamPricing ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </div>

        {/* Team Plans - Collapsible */}
        {showTeamPricing && (
          <div className="space-y-4">
            {teamPlans.map((p) => (
              <div 
                key={p.key}
                className="relative border-2 rounded-2xl p-6 flex flex-col justify-between bg-white shadow-md border-slate-200"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{copy.planTitles[p.key as keyof typeof copy.planTitles] || p.title}</h3>
                  <div className="mt-3 flex items-end text-[#F76511]">
                    <span className="text-4xl font-bold">{p.priceText}</span>
                    <BillingLabel label={p.billingLabel === '/year' ? copy.billingLabels.year : p.billingLabel} />
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{copy.planBlurbs[p.key as keyof typeof copy.planBlurbs] || p.blurb}</p>
                  {p.callout && (
                    <p className="text-xs text-emerald-600 font-semibold mt-1">{copy.planCallouts[p.key as keyof typeof copy.planCallouts] || p.callout}</p>
                  )}
                </div>
                {disableBuy ? (
                  <Link 
                    href={locale === 'es' ? '/es/safety#pricing' : '/safety#pricing'}
                    className="mt-6 w-full text-center px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors" 
                    data-testid={`safety-see-${p.key}`}
                  >
                    {copy.seeOnPricing}
                  </Link>
                ) : p.priceId ? (
                  <form action={createTrainingCheckoutSessionFromForm} className="mt-6">
                    <input type="hidden" name="priceId" value={p.priceId} />
                    <Suspense><ReferralHiddenInput /></Suspense>
                    <Suspense><RequestParamsHiddenInputs /></Suspense>
                    <ClickIdsHiddenInput />
                    <button 
                      type="submit" 
                      className="w-full px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg bg-slate-900 text-white hover:bg-slate-800"
                      data-testid={`safety-top-buy-${p.key}`}
                    >
                      {copy.buyNow}
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/contact"
                    className="mt-6 w-full text-center px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    data-testid={`safety-top-contact-${p.key}`}
                  >
                    {copy.contact}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-center text-slate-600">
        {copy.alreadyCode} <a href="/redeem" className="text-[#F76511] underline hover:text-orange-600">{copy.redeem}</a>
      </p>
      <p className="mt-2 text-sm text-center text-slate-600">
        {copy.wantDetails} <a href={locale === 'es' ? '/es/safety#pricing' : '/safety#pricing'} className="text-[#F76511] underline hover:text-orange-600">{copy.fullPricing}</a>
      </p>
    </section>
  );
}
