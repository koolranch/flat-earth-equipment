/**
 * Google Analytics and Google Ads tracking helpers
 * 
 * Setup Instructions:
 * 1. Add NEXT_PUBLIC_GA_MEASUREMENT_ID to your .env file
 * 2. Add NEXT_PUBLIC_GOOGLE_ADS_ID to your .env file
 * 3. The scripts will be injected via app/layout.tsx
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

// Google Analytics 4 event tracking
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// Google Ads conversion tracking
export function trackConversion(conversionLabel: string, value?: number, currency: string = 'USD', transactionId?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    if (adsId) {
      window.gtag('event', 'conversion', {
        send_to: `${adsId}/${conversionLabel}`,
        value: value,
        currency: currency,
        transaction_id: transactionId,
      });
    }
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

    // Google Ads conversion (if configured)
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    if (adsId && conversionLabel) {
      window.gtag('event', 'conversion', {
        send_to: `${adsId}/${conversionLabel}`,
        value: params.value,
        currency: params.currency || 'USD',
        transaction_id: params.transactionId,
      });
    }
  }
}

export {};

