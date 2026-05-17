/**
 * Web-side tracking for app store download clicks. Fires both a GA4 event and
 * a Google Ads conversion so we can see in Google Ads how often /safety
 * visitors convert into mobile installs.
 *
 * Both gtag calls set `transport_type: 'beacon'` so the request is sent via
 * `navigator.sendBeacon` instead of fetch/XHR. Beacons are fire-and-forget
 * and survive the cross-origin navigation that happens immediately after the
 * click — without this flag, iOS Safari aggressively cancels in-flight XHR
 * when we assign `window.location.href = <store URL>` and the event is lost.
 *
 * gtag falls back to image-pixel transport on browsers without sendBeacon
 * support, which is also navigation-safe, so beacon mode is always safe to
 * request.
 */

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-16989996368';

// TODO: Replace with the real conversion label from Google Ads once the
// "App Download Click" conversion action is created. Until then, the send_to
// value still reaches Google Ads but won't match a configured action.
const APP_DOWNLOAD_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_APP_DOWNLOAD_LABEL || 'APP_DOWNLOAD_CLICK_LABEL';

/**
 * Small grace period between dispatching the tracking call and assigning
 * `window.location.href`. With `transport_type: 'beacon'` the request is
 * already queued by the browser before we navigate, but a tiny delay still
 * helps gtag finish any internal queueing on slow devices.
 */
const POST_TRACK_NAV_DELAY_MS = 250;

export type AppDownloadPlatform = 'android' | 'ios';

interface TrackAppDownloadClickArgs {
  platform: AppDownloadPlatform;
  placement?: string;
  stateParam?: string | null;
}

export function trackAppDownloadClick({
  platform,
  placement = 'safety_page',
  stateParam,
}: TrackAppDownloadClickArgs): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${APP_DOWNLOAD_CONVERSION_LABEL}`,
      value: 0,
      currency: 'USD',
      transport_type: 'beacon',
    });
  } catch {}

  try {
    window.gtag('event', 'app_download_click', {
      platform,
      source: placement,
      state: stateParam || 'none',
      transport_type: 'beacon',
    });
  } catch {}

  try {
    window.dataLayer?.push({
      event: 'app_download_click',
      platform,
      placement,
      state: stateParam || 'none',
    });
  } catch {}
}

/**
 * Redirect to the app store URL after the tracking call had a moment to enter
 * the network stack. Use this from click handlers right after calling
 * `trackAppDownloadClick`. Single source of truth for the delay so we can tune
 * it in one place without touching every CTA component.
 */
export function navigateToStoreAfterTracking(url: string): void {
  if (typeof window === 'undefined' || !url) return;
  window.setTimeout(() => {
    window.location.href = url;
  }, POST_TRACK_NAV_DELAY_MS);
}
