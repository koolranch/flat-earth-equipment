'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { slugToTitle } from '@/lib/state';
import { trackEvent } from '@/lib/analytics/gtag';

export default function StickyCTA() {
  const params = useParams() as Record<string, string> | null;
  const slug = (params?.state || params?.slug || '').toLowerCase();
  const STATE = slugToTitle(slug);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCheckout = async () => {
    // Track begin_checkout event
    trackEvent('begin_checkout', {
      course: 'forklift',
      value: 59,
      currency: 'USD',
      state: STATE,
      source: 'sticky_cta',
      items: [{
        item_id: 'price_1RS834HJI548rO8JpJMyGhL3',
        item_name: 'Online Forklift Certification',
        price: 59,
      }]
    });
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            priceId: 'price_1RS834HJI548rO8JpJMyGhL3',
            quantity: 1,
            isTraining: true
          }]
        })
      });
      
      const data = await response.json();
      
      if (data.sessionId) {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: data.sessionId });
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/90 md:hidden border-t border-white/10">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">Get certified in {STATE}</div>
          <div className="text-xs text-slate-300">$59 • Under 60 minutes</div>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={isLoading}
          className="rounded-lg bg-orange-500 px-5 py-2.5 text-white font-bold hover:bg-orange-600 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoading ? 'Loading...' : 'Start Now →'}
        </button>
      </div>
    </div>
  );
}

