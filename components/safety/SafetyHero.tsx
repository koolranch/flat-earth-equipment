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
      value: 59,
      currency: 'USD',
      items: [{
        item_id: 'price_1RS834HJI548rO8JpJMyGhL3',
        item_name: 'Online Forklift Certification',
        price: 59,
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
            priceId: 'price_1RS834HJI548rO8JpJMyGhL3', // Single operator forklift cert
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
    <section className="relative isolate overflow-hidden bg-slate-900 text-white h-[400px] sm:h-[450px]">
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
      <div className="relative z-10 h-full flex items-center justify-center">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16 text-center">
        <p className="text-xs uppercase tracking-widest text-emerald-300/90">OSHA-Aligned Training</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Get Forklift Certified — $59</h1>
        <p className="mt-3 text-base sm:text-lg text-slate-300">100% online • ~60 minutes • Same-day wallet card • OSHA 29 CFR 1910.178(l) aligned</p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 max-w-lg mx-auto">
          <button
            data-cta="hero-start"
            onClick={handleStart}
            disabled={isLoading}
            className="inline-flex flex-1 items-center justify-center rounded-xl px-6 py-4 text-base font-semibold bg-[#F76511] text-white shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F76511]/50 transition-all hover:bg-orange-600 disabled:opacity-50 disabled:cursor-wait"
            aria-label="Start Certificate — $59"
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
              'Start Certificate — $59'
            )}
          </button>
          <a
            href="#preview"
            className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur px-6 py-4 text-base font-semibold text-white hover:bg-white/20 transition-all"
          >
            Preview Module 1 (Free)
          </a>
        </div>
        {error && (
          <p className="mt-3 text-red-400 text-sm">{error}</p>
        )}
        <p className="mt-3 text-sm text-slate-300">Secure checkout — Apple Pay / Google Pay / Link</p>
      </div>
      </div>
    </section>
  );
}

