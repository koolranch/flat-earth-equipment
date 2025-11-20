/* eslint-disable react/jsx-no-target-blank */
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { trackEvent } from "@/lib/analytics/gtag";
import { trackLanding, trackCTA, trackCheckoutBegin } from "@/lib/analytics/vercel-funnel";
import { STATE_TO_USPS } from '@/lib/state';

export default function SafetyHero() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedState, setDetectedState] = useState<string | null>(null);
  
  // Track landing view and detect state once on mount
  useEffect(() => {
    trackLanding(49);
    
    // Client-side state detection from URL params or sessionStorage
    const stored = sessionStorage.getItem('funnel_state');
    if (stored) {
      setDetectedState(stored);
      return;
    }
    
    const params = new URLSearchParams(window.location.search);
    const utmState = params.get('utm_state');
    if (utmState) {
      sessionStorage.setItem('funnel_state', utmState);
      setDetectedState(utmState);
    }
  }, []);
  
  // Get full state name from code
  const stateCode = detectedState?.toLowerCase();
  const stateName = stateCode && STATE_TO_USPS[stateCode] 
    ? STATE_TO_USPS[stateCode] 
    : null;

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
            priceId: 'price_1SToXBHJI548rO8JZnnTwKER', // Black Friday price
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
    <section className="relative isolate overflow-hidden bg-slate-900 text-white min-h-[500px] sm:h-[500px]">
      {/* Background Image */}
      <Image
        src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
        alt="Forklift certification training"
        fill
        className="object-cover object-center"
        priority
        fetchPriority="high"
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          {/* Black Friday badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/30 px-4 py-2 rounded-full mb-3 animate-in fade-in duration-700">
            <span className="text-xs font-bold text-orange-300">🎉 BLACK FRIDAY</span>
            <span className="text-xs text-white/80">•</span>
            <span className="text-xs text-emerald-300 font-semibold">Save $10</span>
          </div>
          
          <p className="text-xs uppercase tracking-widest text-emerald-300/90 mb-4">OSHA-Compliant Forklift Training</p>
          
          {/* Dynamic H1 with state */}
          <h1 className="text-3xl font-bold sm:text-4xl text-balance leading-tight">
            {stateName 
              ? `Get ${stateName} Forklift Certification in Under 30 Minutes`
              : 'Get OSHA Forklift Certification in Under 30 Minutes'
            }
          </h1>
          
          {/* Clear price and time */}
          <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed">
            <span className="font-semibold">About 30 Minutes</span> • 
            <span className="inline-flex items-baseline gap-1.5 mx-1">
              <span className="text-slate-400 line-through text-sm">$59</span>
              <span className="font-bold text-white">$49</span>
            </span>
            • 100% online • Same-day wallet card
          </p>
          
          {/* Primary CTA */}
          <div className="mt-8">
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="inline-flex items-center rounded-xl bg-orange-600 px-10 py-5 text-xl font-bold text-white hover:bg-orange-700 transition-all duration-300 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-wait"
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
                'Start — $49'
              )}
            </button>
          </div>
          
          {/* Trust note - directly under CTA */}
          <p className="mt-3 text-sm text-white/90">
            🔒 Secure checkout • Instant access • Accepted nationwide
          </p>
          
          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}
          
          {/* Social Proof */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-white shadow-sm text-orange-700 flex items-center justify-center font-bold text-xs">JD</div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white shadow-sm text-emerald-700 flex items-center justify-center font-bold text-xs">SK</div>
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm text-blue-700 flex items-center justify-center font-bold text-xs">PR</div>
              <div className="w-10 h-10 rounded-full bg-brand-100 border-2 border-white shadow-sm text-brand-700 flex items-center justify-center font-bold text-xs">+2k</div>
            </div>
            
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex text-yellow-400 text-base mb-1">
                ★★★★★
              </div>
              <p className="text-white/90 font-medium">Trusted by 2,000+ operators</p>
            </div>
          </div>
          
          <p className="mt-4 text-sm text-emerald-300 font-medium">✨ Lifetime access • Free refresher in 3 years</p>
        </div>
      </div>
    </section>
  );
}

