'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { slugToTitle } from '@/lib/state';
import { trackEvent, trackWebCheckoutInitiated } from '@/lib/analytics/gtag';
import { trackLanding, trackCTA, trackCheckoutBegin } from '@/lib/analytics/vercel-funnel';
import { forkliftStates } from '@/src/data/forkliftStates';
import { StateMetrics } from '@/lib/safety/stateMetrics';
import AppDownloadCTA from '@/components/safety/AppDownloadCTA';
import { getMarketingDict } from '@/i18n';

interface Props {
  metrics?: StateMetrics;
}

export default function StateHero({ metrics }: Props) {
  const params = useParams() as Record<string, string> | null;
  const slug = (params?.state || params?.slug || '').toLowerCase();
  const dict = getMarketingDict('en');
  const copy = dict.safety.hero;

  const stateInfo = forkliftStates.find((s) => s.code === slug);
  const STATE = stateInfo?.name || slugToTitle(slug);

  const topCities = metrics?.topCities?.slice(0, 3).join(', ') || '';
  const validationText = topCities
    ? `Valid in ${topCities} & all of ${STATE}`
    : `Valid in all of ${STATE}`;

  const operatorCount = metrics?.operatorsCertified
    ? `${metrics.operatorsCertified.toLocaleString()}+`
    : '2,000+';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackLanding(49);
  }, []);

  const handleCheckout = async (source = 'state_hero_desktop') => {
    try {
      trackCTA('hero', 49);
    } catch {}

    trackWebCheckoutInitiated({
      source,
      priceId: 'price_1SToXBHJI548rO8JZnnTwKER',
      state: slug,
      value: 49,
    });

    trackEvent('begin_checkout', {
      course: 'forklift',
      value: 49,
      currency: 'USD',
      state: STATE,
      items: [
        {
          item_id: 'price_1SToXBHJI548rO8JZnnTwKER',
          item_name: 'Online Forklift Certification',
          price: 49,
          quantity: 1,
        },
      ],
    });

    let funnelState = null;
    try {
      funnelState = trackCheckoutBegin(49, 'price_1SToXBHJI548rO8JZnnTwKER');
    } catch {}

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              priceId: 'price_1SToXBHJI548rO8JZnnTwKER',
              quantity: 1,
              isTraining: true,
              metadata: {
                ...(funnelState && { utm_state: funnelState }),
              },
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.sessionId) {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (stripe) {
          const { error: stripeError } = await stripe.redirectToCheckout({
            sessionId: data.sessionId,
          });
          if (stripeError) {
            throw stripeError;
          }
        }
      } else if (data.error) {
        setError(data.error);
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 md:py-20">
        <div className="mb-4 inline-flex animate-in fade-in items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 shadow-lg shadow-orange-500/5 backdrop-blur-md duration-700 md:mb-6 md:px-4 md:py-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 md:text-[11px]">
            100% Online
          </span>
          <span className="text-xs text-white/40">•</span>
          <span className="text-xs font-semibold tracking-wide text-emerald-300">OSHA Compliant</span>
        </div>

        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tighter text-white md:text-6xl">
          Get {STATE} Forklift Certified Online
        </h1>

        <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-lg font-medium text-slate-200">
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Done in 30 Mins
          </span>
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Valid in {STATE}
          </span>
        </div>

        <div className="md:hidden">
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => handleCheckout('state_hero_mobile')}
              disabled={isLoading}
              className="group inline-flex w-full max-w-sm items-center justify-center rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-8 py-4 font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_8px_rgba(249,115,22,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(249,115,22,0.3)] active:scale-95 active:shadow-sm disabled:cursor-wait disabled:opacity-50"
            >
              {isLoading ? copy.processing : copy.organicPrimaryCta}
            </button>
            <div className="flex flex-col items-center gap-2">
              <p className="text-center text-sm text-slate-300">{copy.organicAppSecondary}</p>
              <AppDownloadCTA
                placement="state_hero_mobile_app"
                stateParam={slug}
                primaryLabel={dict.safety.appDownload.pricingPrimaryLabel}
                showPrimaryButton
                showWebFallback={false}
                showTrustLine={false}
                className="items-center"
                buttonClassName="w-full max-w-sm px-6 py-3 text-base"
                locale="en"
                t={dict}
              />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">{copy.trustLine}</p>
        </div>

        <div className="hidden md:block">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <button
              type="button"
              onClick={() => handleCheckout('state_hero_desktop')}
              disabled={isLoading}
              className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-12 py-6 font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_8px_rgba(249,115,22,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(249,115,22,0.3)] active:scale-95 active:shadow-sm disabled:cursor-wait disabled:opacity-50"
            >
              <span className="text-xl tracking-tight md:text-2xl">
                {isLoading ? copy.processing : copy.desktopCta}
              </span>
            </button>
            <p className="max-w-[200px] text-sm leading-snug text-slate-400/80 sm:pt-2">
              🔒 {copy.secureCheckout}
            </p>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-slate-300">{dict.safety.appDownload.studyFirstEyebrow}</p>
            <AppDownloadCTA
              placement="state_hero_desktop"
              stateParam={slug}
              showPrimaryButton={false}
              showWebFallback={false}
              showTrustLine
              className="items-start"
              locale="en"
              t={dict}
            />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-400/80 md:justify-start">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
          </span>
          High Demand in {STATE}
        </div>

        <p className="mt-4 flex flex-col gap-1 text-center text-sm text-slate-400/80 md:text-left">
          <span>{validationText}</span>
          <span className="mt-1 flex items-center justify-center gap-2 text-xs font-medium text-emerald-400/90 md:justify-start md:text-sm md:font-normal md:text-slate-400/80">
            <span>✓ OSHA Compliant</span>
            <span>•</span>
            <span>✓ Study free in the app</span>
          </span>
        </p>

        {error && (
          <p className="mt-4 inline-block rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex -space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-800 text-xs font-medium text-slate-300 shadow-md ring-2 ring-slate-900/50">
              JD
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-800 text-xs font-medium text-slate-300 shadow-md ring-2 ring-slate-900/50">
              SK
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-800 text-xs font-medium text-slate-300 shadow-md ring-2 ring-slate-900/50">
              PR
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-800 text-xs font-medium text-slate-300 shadow-md ring-2 ring-slate-900/50">
              {metrics?.operatorsCertified ? '2k+' : '+2k'}
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 sm:items-start">
            <div className="flex gap-0.5 text-sm text-yellow-400">
              {'★★★★★'.split('').map((star, i) => (
                <span key={i}>{star}</span>
              ))}
            </div>
            <p className="text-sm font-medium text-slate-400">Trusted by {operatorCount} operators</p>
          </div>
        </div>

        <div className="mt-12 hidden flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/5 pt-8 text-sm text-slate-400 md:flex">
          <span className="flex items-center gap-2.5 transition-colors hover:text-slate-300">
            <svg className="h-5 w-5 text-emerald-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Accepted in all 50 states</span>
          </span>
          <span className="flex items-center gap-2.5 transition-colors hover:text-slate-300">
            <svg className="h-5 w-5 text-emerald-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Under 30 minutes</span>
          </span>
          <span className="flex items-center gap-2.5 transition-colors hover:text-slate-300">
            <svg className="h-5 w-5 text-emerald-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Same-day certificate</span>
          </span>
        </div>
      </div>
    </section>
  );
}
