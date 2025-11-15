"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { trackEvent } from "@/lib/analytics/gtag";

export default function StickyCTA() {
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
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
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-t border-gray-200 px-4 py-3 md:hidden">
      <div className="flex items-center">
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full inline-flex justify-center rounded-lg bg-orange-600 px-4 py-3 text-white font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoading ? 'Loading...' : 'Start — $49'}
        </button>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
