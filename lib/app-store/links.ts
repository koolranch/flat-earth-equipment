/**
 * Single source of truth for the Forklift Certified mobile app links and the
 * /safety page's app-first behavior.
 *
 * To flip iOS to live in 1 line: set `IOS_APP_LIVE = true` and fill in
 * `IOS_APP_STORE_URL`. The `/safety` hero, sticky CTA, and pricing card pick
 * up the change automatically.
 */

export const IOS_APP_LIVE = true;

export const IOS_APP_STORE_URL =
  'https://apps.apple.com/us/app/forklift-certified-pro/id6759796469';

export const ANDROID_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.flateartheequipment.forkliftcertified';

export const PLAY_BADGE_SRC =
  'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png';

export const APPLE_BADGE_SRC =
  'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg';

export const PLAY_BADGE_SRC_ES =
  'https://play.google.com/intl/es-419/badges/static/images/badges/es-419_badge_web_generic.png';

// Apple does not expose stable localized badge URLs from the same CDN path.
// Keep the live English SVG as the fallback until a Spanish asset is added.
export const APPLE_BADGE_SRC_ES = APPLE_BADGE_SRC;

export type AppPlatform = 'android' | 'ios';
export type StoreBadgeLocale = 'en' | 'es';

/**
 * Detect the visitor's platform from the user-agent. Returns `null` on the
 * server or for non-mobile browsers so callers can fall back to web defaults.
 */
export function detectAppPlatform(): AppPlatform | null {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/i.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return null;
}

/**
 * Returns the live store URL for a platform, honoring the iOS launch flag.
 * When iOS is not live yet, iOS visitors are routed to Android Play so the
 * page never shows a dead "coming soon" link.
 */
export function getStoreUrlForPlatform(platform: AppPlatform | null): string {
  if (platform === 'ios' && IOS_APP_LIVE && IOS_APP_STORE_URL) {
    return IOS_APP_STORE_URL;
  }
  return ANDROID_PLAY_STORE_URL;
}

/**
 * Append our standard UTM params to a Play Store / App Store URL so we can
 * trace which web entry point produced an install.
 */
export function buildStoreDownloadUrl(
  storeUrl: string,
  options: { stateParam?: string | null; placement?: string } = {}
): string {
  if (!storeUrl) return storeUrl;
  const { stateParam, placement } = options;

  try {
    const url = new URL(storeUrl);
    const currentParams =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    const utmContent =
      currentParams.get('utm_content') ||
      (stateParam && stateParam.length > 0 ? stateParam : 'direct');
    const utmTerm = currentParams.get('utm_term') || placement || 'safety_page';

    url.searchParams.set('utm_source', currentParams.get('utm_source') || 'website');
    url.searchParams.set('utm_medium', currentParams.get('utm_medium') || 'safety_page');
    url.searchParams.set('utm_campaign', currentParams.get('utm_campaign') || 'app_launch');
    url.searchParams.set('utm_content', utmContent);
    url.searchParams.set('utm_term', utmTerm);

    const gclid = currentParams.get('gclid');
    if (gclid) url.searchParams.set('gclid', gclid);

    return url.toString();
  } catch {
    const utmContent = stateParam && stateParam.length > 0 ? stateParam : 'direct';
    const utmTerm = placement || 'safety_page';
    const separator = storeUrl.includes('?') ? '&' : '?';
    return `${storeUrl}${separator}utm_source=website&utm_medium=safety_page&utm_campaign=app_launch&utm_content=${encodeURIComponent(
      utmContent
    )}&utm_term=${encodeURIComponent(utmTerm)}`;
  }
}

export function getStoreBadgeSrc(platform: AppPlatform, locale: StoreBadgeLocale = 'en'): string {
  if (platform === 'ios') return locale === 'es' ? APPLE_BADGE_SRC_ES : APPLE_BADGE_SRC;
  return locale === 'es' ? PLAY_BADGE_SRC_ES : PLAY_BADGE_SRC;
}
