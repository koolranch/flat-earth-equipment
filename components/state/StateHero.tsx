'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { STATE_TO_USPS, slugToTitle } from '@/lib/state';
import { trackEvent } from '@/lib/analytics/gtag';
import { trackLanding, trackCTA, trackCheckoutBegin } from '@/lib/analytics/vercel-funnel';
import { forkliftStates } from '@/src/data/forkliftStates';

export default function StateHero() {
  const params = useParams() as Record<string, string> | null;
  const slug = (params?.state || params?.slug || '').toLowerCase();
  
  // Get full state name from code (e.g., "oh" → "Ohio")
  const stateInfo = forkliftStates.find(s => s.code === slug);
  const STATE = stateInfo?.name || slugToTitle(slug); // fallback to title-cased slug
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track landing view once on mount
  useEffect(() => {
    trackLanding(49);
  }, []);

  const handleCheckout = async () => {
    // Track CTA click to Vercel (safe, won't block checkout)
    try {
      trackCTA('hero', 49);
    } catch {}
    
    // Track begin_checkout event (EXISTING GA4 - unchanged)
    trackEvent('begin_checkout', {
      course: 'forklift',
      value: 49,
      currency: 'USD',
      state: STATE,
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
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px'}}></div>
      </div>
      
      <div className="relative mx-auto max-w-5xl px-4 py-12 md:py-16">
        {/* Black Friday badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/30 px-4 py-2 rounded-full mb-4 animate-in fade-in duration-700">
          <span className="text-xs font-bold text-orange-300">🎉 BLACK FRIDAY</span>
          <span className="text-xs text-white/80">•</span>
          <span className="text-xs text-emerald-300 font-semibold">Save $10</span>
        </div>
        
        <p className="text-xs uppercase tracking-widest text-emerald-300/90 mb-3">OSHA-Compliant Forklift Training</p>
        
        <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
          Get {STATE} Forklift Certification in Under 30 Minutes
        </h1>
        <p className="mt-4 text-slate-200 text-base md:text-lg max-w-3xl leading-relaxed">
          <span className="font-semibold">About 30 Minutes</span> • <span className="inline-flex items-baseline gap-1.5">
            <span className="text-slate-400 line-through text-base">$59</span>
            <span className="font-bold">$49</span>
          </span> • Same-day certificate • OSHA-aligned online training
        </p>
        <div className="mt-6">
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-4 md:px-10 md:py-5 font-bold text-white shadow-lg hover:bg-orange-600 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 text-lg md:text-xl disabled:opacity-50 disabled:cursor-wait active:scale-95"
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
        
        {/* Social Proof - Mobile optimized */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 border-2 border-white shadow-sm text-orange-700 flex items-center justify-center font-bold text-xs">JD</div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 border-2 border-white shadow-sm text-emerald-700 flex items-center justify-center font-bold text-xs">SK</div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm text-blue-700 flex items-center justify-center font-bold text-xs">PR</div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 border-2 border-white shadow-sm text-purple-700 flex items-center justify-center font-bold text-xs">+2k</div>
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex text-yellow-400 text-sm mb-1">★★★★★</div>
            <p className="text-slate-300 text-xs sm:text-sm font-medium">Trusted by 2,000+ operators</p>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-slate-300">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs sm:text-sm">Accepted in all 50 states</span>
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs sm:text-sm">Under 30 minutes</span>
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs sm:text-sm">Same-day certificate</span>
          </span>
        </div>
      </div>
    </section>
  );
}

