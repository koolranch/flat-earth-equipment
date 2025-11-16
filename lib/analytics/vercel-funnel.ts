/**
 * Vercel Analytics + GA4 dual-tracking for training sales funnel
 * Privacy-friendly micro-funnel: Landing → CTA → Checkout → Purchase
 * 
 * All tracking is fail-safe and won't break checkout flows.
 * Tracks state-by-state performance for campaign optimization.
 */

'use client';

import { track } from '@vercel/analytics/react';

// Safe wrapper - never throws, won't block checkout
function safeTrack(event: string, props: Record<string, any>) {
  try {
    track(event, props);
  } catch (e) {
    console.warn(`[Vercel Analytics] ${event} failed:`, e);
  }
}

/**
 * Extract state from URL params or route path
 * Priority: utm_state param > route path > sessionStorage
 */
function getFunnelState(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Check session storage first (for continuity)
  const stored = sessionStorage.getItem('funnel_state');
  if (stored) return stored;
  
  // Extract from URL parameter (utm_state from Google Ads)
  const params = new URLSearchParams(window.location.search);
  const utmState = params.get('utm_state');
  if (utmState) {
    sessionStorage.setItem('funnel_state', utmState);
    return utmState;
  }
  
  // Infer from route (e.g., /safety/forklift/tx → "tx")
  const match = window.location.pathname.match(/\/safety\/forklift\/([a-z]{2})/);
  if (match) {
    sessionStorage.setItem('funnel_state', match[1]);
    return match[1];
  }
  
  return null;
}

/**
 * Track landing page view
 * Fired on /safety page load
 */
export function trackLanding(price: number) {
  const state = getFunnelState();
  safeTrack('landing_view', { 
    price,
    ...(state && { state }),
  });
}

/**
 * Track CTA button click
 * Placement: 'hero' (above fold) or 'sticky' (mobile bottom bar)
 */
export function trackCTA(placement: 'hero' | 'sticky', price: number) {
  const state = getFunnelState();
  safeTrack('cta_click', { 
    placement, 
    price,
    ...(state && { state }),
  });
}

/**
 * Track begin checkout
 * Fired when user initiates Stripe checkout
 * Returns state for passing to Stripe metadata
 */
export function trackCheckoutBegin(price: number, priceId: string): string | null {
  const state = getFunnelState();
  safeTrack('begin_checkout', { 
    price, 
    priceId,
    method: 'checkout_link',
    ...(state && { state }),
  });
  
  // Return state so it can be passed to Stripe
  return state;
}

/**
 * Track purchase completion (client-side)
 * Fired on success page after Stripe payment
 */
export function trackPurchaseClient(transactionId: string, amount: number) {
  const state = getFunnelState();
  safeTrack('purchase', { 
    transactionId, 
    amount, 
    currency: 'usd',
    ...(state && { state }),
  });
}

/**
 * Track checkout error (optional)
 * Helps identify Stripe integration issues
 */
export function trackCheckoutError(errorCategory: string, price: number, placement: 'hero' | 'sticky') {
  const state = getFunnelState();
  safeTrack('checkout_error', {
    error_category: errorCategory,
    price,
    placement,
    ...(state && { state }),
  });
}

