export type AnalyticsPayload = { name: string; params?: Record<string, any> };
export function track(name: string, params: Record<string, any> = {}) {
  try {
    // Your real analytics call can live here (GA4, Rudder, Segment, PostHog, etc.)
    // For now we emit a custom event and console log for QA.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('analytics', { detail: { name, params } }));
    }
    // eslint-disable-next-line no-console
    console.log('[analytics]', name, params);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('analytics error', e);
  }
}
