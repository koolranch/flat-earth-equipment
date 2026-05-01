'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PLANS } from '@/lib/training/plans';
import { createTrainingCheckoutSessionFromForm } from '@/app/training/checkout/actions';
import Link from 'next/link';
import AppDownloadCTA from '@/components/safety/AppDownloadCTA';

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

export default function PricingStrip({ disableBuy = false }: { disableBuy?: boolean }) {
  const [showTeamPricing, setShowTeamPricing] = useState(false);
  
  const singlePlan = PLANS[0]; // Single Operator plan
  const teamPlans = PLANS.slice(1); // 5-Pack, 25-Pack, Unlimited

  return (
    <section id="pricing" className="mt-8 mx-auto max-w-6xl px-4">
      <h2 className="text-3xl font-bold text-center text-slate-900">Pricing</h2>
      <p className="text-center text-base text-slate-600 mt-2">Choose a plan and checkout securely.</p>
      <p className="text-center text-sm text-slate-600 mt-1">Team plans include seat management, progress tracking, and certificate verification.</p>
      <p className="text-center text-xs text-emerald-600 font-medium mt-2">✨ All seats include lifetime course access and free 3-year theory refresher.</p>
      
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
                  POPULAR
                </span>
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-slate-900">{p.title}</h3>
              <div className="mt-3 flex items-end text-[#F76511]">
                <span className="text-4xl font-bold">{p.priceText}</span>
                <BillingLabel label={p.billingLabel} />
              </div>
              <p className="text-sm text-slate-600 mt-2">{p.blurb}</p>
              {p.callout && (
                <p className="text-xs text-emerald-600 font-semibold mt-1">{p.callout}</p>
              )}
            </div>
            {disableBuy ? (
              <Link 
                href="/safety#pricing" 
                className="mt-6 w-full text-center px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors" 
                data-testid={`safety-see-${p.key}`}
              >
                See on pricing page
              </Link>
            ) : p.priceId ? (
              <form action={createTrainingCheckoutSessionFromForm} className="mt-6">
                <input type="hidden" name="priceId" value={p.priceId} />
                <Suspense><ReferralHiddenInput /></Suspense>
                <Suspense><RequestParamsHiddenInputs /></Suspense>
                <button 
                  type="submit" 
                  className={`w-full px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg ${
                    p.popular 
                      ? 'bg-[#F76511] text-white hover:bg-orange-600' 
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                  data-testid={`safety-top-buy-${p.key}`}
                >
                  Buy Now →
                </button>
              </form>
            ) : (
              <Link
                href="/contact"
                className="mt-6 w-full text-center px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                data-testid={`safety-top-contact-${p.key}`}
              >
                Contact Us →
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
              GET CERTIFIED — $49
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">Get Certified — $49</h3>
            <p className="text-sm text-slate-600 mt-2">
              Train free on the app. Pay $49 only when you pass the final exam.
            </p>
            <p className="text-sm text-slate-600 mt-2">
              💼 Or have your employer pay — request from inside the app.
            </p>
          </div>

          {disableBuy ? (
            <Link
              href="/safety#pricing"
              className="mt-2 w-full text-center px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              data-testid={`safety-see-${singlePlan.key}`}
            >
              See on pricing page
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <AppDownloadCTA
                placement="safety_pricing"
                primaryLabel="Download Free App"
                showWebFallback={false}
                showTrustLine={false}
                className="items-center"
              />

              <form action={createTrainingCheckoutSessionFromForm}>
                <input type="hidden" name="priceId" value={singlePlan.priceId} />
                <Suspense><ReferralHiddenInput /></Suspense>
                <Suspense><RequestParamsHiddenInputs /></Suspense>
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-xl font-semibold transition-all border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  data-testid={`safety-top-buy-${singlePlan.key}`}
                >
                  Buy Now — $49 (instant web access)
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Team Pricing Accordion */}
        <div className="text-center">
          <button
            onClick={() => setShowTeamPricing(!showTeamPricing)}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-[#F76511] font-medium px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <span>Running a team? View Employer Plans</span>
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
                  <h3 className="text-xl font-bold text-slate-900">{p.title}</h3>
                  <div className="mt-3 flex items-end text-[#F76511]">
                    <span className="text-4xl font-bold">{p.priceText}</span>
                    <BillingLabel label={p.billingLabel} />
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{p.blurb}</p>
                  {p.callout && (
                    <p className="text-xs text-emerald-600 font-semibold mt-1">{p.callout}</p>
                  )}
                </div>
                {disableBuy ? (
                  <Link 
                    href="/safety#pricing" 
                    className="mt-6 w-full text-center px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors" 
                    data-testid={`safety-see-${p.key}`}
                  >
                    See on pricing page
                  </Link>
                ) : p.priceId ? (
                  <form action={createTrainingCheckoutSessionFromForm} className="mt-6">
                    <input type="hidden" name="priceId" value={p.priceId} />
                    <Suspense><ReferralHiddenInput /></Suspense>
                    <Suspense><RequestParamsHiddenInputs /></Suspense>
                    <button 
                      type="submit" 
                      className="w-full px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg bg-slate-900 text-white hover:bg-slate-800"
                      data-testid={`safety-top-buy-${p.key}`}
                    >
                      Buy Now →
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/contact"
                    className="mt-6 w-full text-center px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    data-testid={`safety-top-contact-${p.key}`}
                  >
                    Contact Us →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-center text-slate-600">
        Already have a code? <a href="/redeem" className="text-[#F76511] underline hover:text-orange-600">Redeem</a>
      </p>
      <p className="mt-2 text-sm text-center text-slate-600">
        Want details? <a href="/safety#pricing" className="text-[#F76511] underline hover:text-orange-600">See full pricing</a>
      </p>
    </section>
  );
}
