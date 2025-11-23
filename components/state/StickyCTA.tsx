'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { slugToTitle } from '@/lib/state';
import { trackEvent } from '@/lib/analytics/gtag';
import { trackCTA, trackCheckoutBegin } from '@/lib/analytics/vercel-funnel';
import { forkliftStates } from '@/src/data/forkliftStates';

export default function StickyCTA() {
  const params = useParams() as Record<string, string> | null;
  const slug = (params?.state || params?.slug || '').toLowerCase();
  
  // Get full state name from code (e.g., "oh" → "Ohio")
  const stateInfo = forkliftStates.find(s => s.code === slug);
  const STATE = stateInfo?.name || slugToTitle(slug); // fallback to title-cased slug
  
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCheckout = async () => {
    // Track CTA click to Vercel (safe, won't block checkout)
    try {
      trackCTA('sticky', 49);
    } catch {}
    
    // Track begin_checkout event (EXISTING GA4 - unchanged)
    trackEvent('begin_checkout', {
      course: 'forklift',
      value: 49,
      currency: 'USD',
      state: STATE,
      source: 'sticky_cta',
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
    <div className="fixed inset-x-0 bottom-0 z-50 bg-slate-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-900/90 md:hidden border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.3)]">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white truncate tracking-tight">{STATE} Certified</div>
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="text-slate-400 line-through decoration-slate-400/50 text-[10px]">$59</span>
            <span className="font-bold text-white">$49</span>
            <span className="w-0.5 h-0.5 rounded-full bg-white/40"></span>
            <span className="truncate text-slate-300">Instant Access</span>
          </div>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={isLoading}
          className="rounded-lg bg-gradient-to-b from-orange-500 to-orange-600 px-5 py-3 text-white font-bold shadow-[0_2px_8px_rgba(249,115,22,0.4)] hover:shadow-[0_4px_12px_rgba(249,115,22,0.5)] transition-all duration-200 active:scale-95 active:shadow-none disabled:opacity-50 disabled:cursor-wait whitespace-nowrap ring-1 ring-white/10 text-sm"
        >
          {isLoading ? 'Loading...' : 'Get Certified - $49'}
        </button>
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
