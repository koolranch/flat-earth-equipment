/**
 * Google Analytics and Google Ads tracking helpers
 * 
 * Setup Instructions:
 * 1. Add NEXT_PUBLIC_GA_MEASUREMENT_ID to your .env file
 * 2. Add NEXT_PUBLIC_GOOGLE_ADS_ID to your .env file
 * 3. Add NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL to your .env file
 * 4. The scripts will be injected via app/layout.tsx
 */

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-16989996368';
const GOOGLE_ADS_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || 'kRqECPiJwKgbENCKu6U_';

// Google Analytics 4 event tracking
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// Google Ads conversion tracking
export function trackConversion(conversionLabel: string, value?: number, currency: string = 'USD', transactionId?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
      value: value,
      currency: currency,
      transaction_id: transactionId,
    });
  }
}

// Track page views (called automatically by gtag config)
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (measurementId) {
      window.gtag('config', measurementId, {
        page_path: url,
      });
    }
  }
}

// E-commerce purchase event (GA4 + Google Ads)
export function trackPurchase(params: {
  transactionId: string;
  value: number;
  currency?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>;
}) {
  if (typeof window !== 'undefined' && window.gtag) {
    // GA4 purchase event
    window.gtag('event', 'purchase', {
      transaction_id: params.transactionId,
      value: params.value,
      currency: params.currency || 'USD',
      items: params.items || [],
    });
    console.log('[Tracking] GA4 purchase event sent:', params.transactionId);

    // Google Ads conversion
    const sendTo = `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`;
    window.gtag('event', 'conversion', {
      send_to: sendTo,
      value: params.value,
      currency: params.currency || 'USD',
      transaction_id: params.transactionId,
    });
    console.log('[Tracking] Google Ads conversion sent:', sendTo, '| value:', params.value, '| txn:', params.transactionId);

    // Debug: gclid cookie status
    const gclCookie = document.cookie.match(/_gcl_aw=([^;]+)/)?.[1];
    console.log('[Tracking] _gcl_aw cookie:', gclCookie || 'NOT FOUND');
  } else {
    console.warn('[Tracking] trackPurchase called but gtag not available');
  }
}

export {};

