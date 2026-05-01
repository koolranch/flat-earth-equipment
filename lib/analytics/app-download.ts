/**
 * Web-side tracking for app store download clicks. Fires both a GA4 event and
 * a Google Ads conversion so we can see in Google Ads how often /safety
 * visitors convert into mobile installs.
 */

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-16989996368';

// TODO: Replace with the real conversion label from Google Ads once the
// "App Download Click" conversion action is created. Until then, the send_to
// value still reaches Google Ads but won't match a configured action.
const APP_DOWNLOAD_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_APP_DOWNLOAD_LABEL || 'APP_DOWNLOAD_CLICK_LABEL';

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
    });
  } catch {}

  try {
    window.gtag('event', 'app_download_click', {
      platform,
      source: placement,
      state: stateParam || 'none',
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
