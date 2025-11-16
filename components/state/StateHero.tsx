'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { STATE_TO_USPS, slugToTitle } from '@/lib/state';
import { trackEvent } from '@/lib/analytics/gtag';
import { trackCTA, trackCheckoutBegin } from '@/lib/analytics/vercel-funnel';

export default function StateHero() {
  const params = useParams() as Record<string, string> | null;
  const slug = (params?.state || params?.slug || '').toLowerCase();
  const STATE = slugToTitle(slug);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          Get Forklift-Certified in {STATE} — $49, Under 60 Minutes
        </h1>
        <p className="mt-4 text-slate-200 text-lg md:text-xl max-w-3xl">
          OSHA-aligned online training with instant digital certificate & wallet card. Your supervisor completes the on-site evaluation.
        </p>
        <div className="mt-6">
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-4 font-bold text-white shadow-lg hover:bg-orange-600 transition-all hover:shadow-xl text-lg disabled:opacity-50 disabled:cursor-wait"
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
              'Get Certified Now — $49 →'
            )}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-red-400 text-sm">{error}</p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-300">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Accepted in all 50 states
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            45–60 minutes
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Same-day certificate
          </span>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
            </svg>
            Apple Pay
          </span>
          <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.93 8.68c-.07-1.53-.42-2.88-1.52-3.98-1.1-1.1-2.45-1.45-3.98-1.52C15.05 3.11 14.68 3 12 3s-3.05.11-4.43.18c-1.53.07-2.88.42-3.98 1.52-1.1 1.1-1.45 2.45-1.52 3.98C2 10.05 2 10.42 2 13s.11 2.95.18 4.32c.07 1.53.42 2.88 1.52 3.98 1.1 1.1 2.45 1.45 3.98 1.52 1.38.07 1.75.18 4.32.18s2.95-.11 4.32-.18c1.53-.07 2.88-.42 3.98-1.52 1.1-1.1 1.45-2.45 1.52-3.98.07-1.38.18-1.75.18-4.32s-.11-2.95-.18-4.32zM12 17.09c-2.81 0-5.09-2.28-5.09-5.09S9.19 6.91 12 6.91s5.09 2.28 5.09 5.09-2.28 5.09-5.09 5.09zm5.29-9.2c-.66 0-1.19-.53-1.19-1.19 0-.66.53-1.19 1.19-1.19.66 0 1.19.53 1.19 1.19 0 .66-.53 1.19-1.19 1.19z"/>
            </svg>
            Google Pay
          </span>
          <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
            Secure Checkout
          </span>
        </div>
      </div>
    </section>
  );
}

