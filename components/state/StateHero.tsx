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
        quantity: 1
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
    <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
      </div>
      
      <div className="relative mx-auto max-w-5xl px-4 py-8 md:py-20"> {/* Reduced padding for mobile */}
        {/* Badge - Hidden on mobile to save vertical space */}
        <div className="hidden md:inline-flex items-center gap-2 bg-orange-500/10 backdrop-blur-md border border-orange-500/20 px-4 py-1.5 rounded-full mb-6 animate-in fade-in duration-700 shadow-lg shadow-orange-500/5">
          <span className="text-[11px] uppercase tracking-widest font-bold text-orange-400">Black Friday</span>
          <span className="text-xs text-white/40">•</span>
          <span className="text-xs text-emerald-300 font-semibold tracking-wide">Save $10</span>
        </div>
        
        <h1 className="text-3xl md:text-6xl font-bold leading-tight tracking-tighter text-white mb-4">
          Get {STATE} Forklift Certified
        </h1>
        
        {/* NEW: Value props moved up for visibility */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-lg text-slate-200 mb-6 font-medium">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Done in 30 Mins
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Valid in {STATE}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full md:w-auto group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-8 py-4 md:px-12 md:py-6 font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_8px_rgba(249,115,22,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(249,115,22,0.3)] active:scale-95 active:shadow-sm disabled:opacity-50 disabled:cursor-wait"
          >
            {/* Enhanced Button Text */}
            <span className="text-xl md:text-2xl tracking-tight">Get Certified Now - $49</span>
          </button>
          
          <p className="text-sm text-slate-400/80 text-center md:text-left">
            Valid in Houston, Dallas, Austin & all of {STATE} • Instant Certificate
          </p>
        </div>
        
        {error && (
          <p className="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 inline-block">{error}</p>
        )}
        
        {/* Social Proof - Moved below CTA for mobile */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
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
            <p className="text-slate-400 text-sm font-medium">Trusted by 2,000+ operators</p>
          </div>
        </div>
        
        {/* Desktop Trust Badges - Hidden on mobile to reduce scroll */}
        <div className="hidden md:flex mt-12 pt-8 border-t border-white/5 flex-wrap items-center gap-y-4 gap-x-8 text-sm text-slate-400">
          <span className="flex items-center gap-2.5 transition-colors hover:text-slate-300">
            <svg className="w-5 h-5 text-emerald-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Accepted in all 50 states</span>
          </span>
          <span className="flex items-center gap-2.5 transition-colors hover:text-slate-300">
            <svg className="w-5 h-5 text-emerald-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Under 30 minutes</span>
          </span>
          <span className="flex items-center gap-2.5 transition-colors hover:text-slate-300">
            <svg className="w-5 h-5 text-emerald-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Same-day certificate</span>
          </span>
        </div>
      </div>
    </section>
  );
}
