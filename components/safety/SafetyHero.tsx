/* eslint-disable react/jsx-no-target-blank */
"use client";
import { useState } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { trackEvent } from "@/lib/analytics/gtag";

export default function SafetyHero() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    // Track begin_checkout event
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
            isTraining: true
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
      {/* Background Image - Same as city pages */}
      <Image
        src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
        alt="Forklift certification training"
        fill
        className="object-cover object-center"
        priority
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-emerald-300/90 mb-4">OSHA-Compliant Forklift Training</p>
          <h1 className="text-3xl font-bold sm:text-4xl text-balance leading-tight">Get OSHA Forklift Certification in Under 60 Minutes</h1>
          <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed">
            100% online • $49 • Same-day wallet card • OSHA 29 CFR 1910.178(l) aligned
          </p>
          <div className="mt-8">
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="inline-flex items-center rounded-lg bg-orange-600 px-8 py-4 text-lg font-semibold text-white hover:bg-orange-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-wait"
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
                'Start Certificate — $49'
              )}
            </button>
          </div>
          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}
          <p className="mt-4 text-sm text-white/90">OSHA 1910.178 compliant · Accepted nationwide · Instant download</p>
          <p className="mt-3 text-sm text-emerald-300 font-medium">✨ Lifetime access. Free theory refresher every 3 years—we'll remind you when it's time.</p>
          <p className="mt-3 text-sm text-slate-300 hidden sm:block">Secure checkout — Apple Pay / Google Pay / Link</p>
        </div>
      </div>
    </section>
  );
}

