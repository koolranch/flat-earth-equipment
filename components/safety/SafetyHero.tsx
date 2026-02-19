/* eslint-disable react/jsx-no-target-blank */
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { trackEvent } from "@/lib/analytics/gtag";
import { trackLanding, trackCTA, trackCheckoutBegin } from "@/lib/analytics/vercel-funnel";
import type { StateData } from "@/lib/data/state-data";

interface SafetyHeroProps {
  stateData?: StateData | null;
}

export default function SafetyHero({ stateData }: SafetyHeroProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track landing view once on mount
  useEffect(() => {
    trackLanding(49);
  }, []);

  const handleStart = async () => {
    // Track CTA click to Vercel (safe, won't block checkout)
    try {
      trackCTA('hero', 49);
    } catch {}
    
    // Track begin_checkout event (EXISTING GA4 - unchanged)
    trackEvent('begin_checkout', {
      course: 'forklift',
      value: 49,
      currency: 'USD',
      items: [{
        item_id: 'price_1SToXBHJI548rO8JZnnTwKER',
        item_name: 'Online Forklift Certification',
        price: 49,
      }]
    });
    
    // Track checkout begin to Vercel and get state
    let funnelState = null;
    try {
      funnelState = trackCheckoutBegin(49, 'price_1SToXBHJI548rO8JZnnTwKER');
    } catch {}

    try {
      (window as any).dataLayer?.push({ event: "cta_click", label: "hero_start_cert" });
    } catch {}

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            priceId: 'price_1SToXBHJI548rO8JZnnTwKER',
            quantity: 1,
            isTraining: true,
            metadata: {
              ...(funnelState && { utm_state: funnelState }),
            }
          }]
        })
      });

      const data = await response.json();

      if (data.sessionId) {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId,
          });
          if (error) {
            throw error;
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
    <section className="relative isolate overflow-hidden bg-slate-950 text-white min-h-[500px] sm:h-[500px]">
      {/* Background Image */}
      <Image
        src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
        alt="Forklift certification training"
        fill
        className="object-cover object-center opacity-40 mix-blend-overlay"
        priority
        fetchPriority="high"
      />
      
      {/* Dark overlay + Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-slate-900/80"></div>
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center md:text-left">
          <div className="flex flex-col md:items-start items-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tighter text-white max-w-4xl text-balance">
              {stateData
                ? `Get ${stateData.name} Forklift Certified Online in Under 30 Minutes`
                : "Get Online Forklift Certification in Under 30 Minutes"}
            </h1>
            
            <p className="mt-6 text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed font-normal">
              {stateData ? (
                <>
                  <span className="text-white font-medium">30 Minutes</span> • <span className="text-white font-semibold">$49</span> • Same-day certificate • OSHA-aligned
                  <span className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-base">
                    <span className="text-emerald-400 font-medium">✓ Valid for {stateData.name} employers</span>
                    <span className="text-emerald-400 font-medium">✓ {stateData.operatorsCertified} {stateData.name} operators certified</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="text-white font-medium">30 Minutes</span> • <span className="text-white font-semibold">$49</span> • Same-day certificate • OSHA-aligned
                </>
              )}
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <button
                onClick={handleStart}
                disabled={isLoading}
                className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-8 py-4 md:px-10 md:py-5 font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_8px_rgba(249,115,22,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(249,115,22,0.3)] active:scale-95 active:shadow-sm disabled:opacity-50 disabled:cursor-wait"
              >
                 {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <span className="text-lg md:text-xl tracking-tight">Start — $49</span>
                )}
              </button>
              
              {/* Trust note - Desktop side position */}
              <p className="hidden sm:block text-sm text-slate-400/80 max-w-[200px] leading-snug text-left">
                🔒 Secure checkout • Instant access
              </p>
            </div>
            
            {/* Trust note - Mobile bottom position */}
            <p className="mt-4 sm:hidden text-sm text-slate-400/80 text-center">
              🔒 Secure checkout • Instant access
            </p>
            
            {error && (
              <p className="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>
            )}
            
            {/* Social Proof & Icons */}
            <div className="mt-12 pt-8 border-t border-white/5 w-full flex flex-col md:flex-row gap-8 items-center md:items-start">
               {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 shadow-md flex items-center justify-center text-xs font-medium text-slate-300 ring-2 ring-slate-900/50">JD</div>
                  <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 shadow-md flex items-center justify-center text-xs font-medium text-slate-300 ring-2 ring-slate-900/50">SK</div>
                  <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 shadow-md flex items-center justify-center text-xs font-medium text-slate-300 ring-2 ring-slate-900/50">PR</div>
                  <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 shadow-md flex items-center justify-center text-xs font-medium text-slate-300 ring-2 ring-slate-900/50">+2k</div>
                </div>
                <div className="flex flex-col items-center sm:items-start gap-0.5">
                  <div className="flex text-yellow-400 text-sm gap-0.5">
                    {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                  </div>
                  <p className="text-slate-400 text-sm font-medium">
                    {stateData
                      ? `Trusted by 2,000+ operators nationwide`
                      : "Trusted by 2,000+ operators"}
                  </p>
                </div>
              </div>

              {/* Icons (Hidden on very small screens if needed, but good for trust) */}
              <div className="hidden md:flex items-center gap-6 text-sm text-slate-400 ml-auto">
                <span className="flex items-center gap-2.5 transition-colors hover:text-slate-300">
                  <svg className="w-5 h-5 text-emerald-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Nationwide</span>
                </span>
                <span className="flex items-center gap-2.5 transition-colors hover:text-slate-300">
                  <svg className="w-5 h-5 text-emerald-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Under 30 min</span>
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

