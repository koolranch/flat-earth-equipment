"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { trackEvent } from "@/lib/analytics/gtag";

const isSafetyRoute = (p: string) => p.startsWith("/safety");

export default function StickyCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isSafetyRoute(pathname)) { setVisible(false); return; }
    const onScroll = () => {
      const el = document.querySelector('[data-cta="hero-start"]') as HTMLElement | null;
      if (!el) { setVisible(true); return; }
      const r = el.getBoundingClientRect();
      const inView = r.top >= 0 && r.bottom <= (window.innerHeight - 140);
      setVisible(!inView);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (!visible) return null;

  const go = async () => {
    // Track event
    trackEvent('begin_checkout', {
      course: 'forklift',
      value: 59,
      currency: 'USD',
      source: 'sticky_cta',
      items: [{
        item_id: 'price_1RS834HJI548rO8JpJMyGhL3',
        item_name: 'Online Forklift Certification',
        price: 59,
      }]
    });
    
    try {
      (window as any).dataLayer?.push({ event: "cta_click", label: "sticky_start" });
    } catch {}
    
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
    <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-3">
      <button 
        onClick={go} 
        disabled={isLoading}
        className="w-full rounded-xl px-4 py-4 text-base font-semibold shadow-lg bg-[#F76511] text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-wait" 
        aria-label="Start — $59"
      >
        {isLoading ? 'Loading...' : 'Start — $59'}
      </button>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}

