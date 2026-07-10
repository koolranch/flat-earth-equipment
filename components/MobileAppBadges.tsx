'use client';

import type { MouseEvent } from 'react';
import {
  ANDROID_PLAY_STORE_URL,
  IOS_APP_LIVE,
  IOS_APP_STORE_URL,
  buildStoreDownloadUrl,
  getStoreBadgeSrc,
} from '@/lib/app-store/links';
import { trackAppDownloadClickAndNavigate } from '@/lib/analytics/app-download';

interface MobileAppBadgesProps {
  className?: string;
  labelClassName?: string;
  placement?: string;
  locale?: 'en' | 'es';
  /** When true, only render on viewports below the desktop footer breakpoint. */
  mobileOnly?: boolean;
}

/**
 * Dual App Store + Google Play badges for footers and secondary placements.
 * Prefer this over Play-only badges now that iOS is live.
 */
export default function MobileAppBadges({
  className = '',
  labelClassName = 'text-sm font-semibold text-slate-700',
  placement = 'footer_badge',
  locale = 'en',
  mobileOnly = true,
}: MobileAppBadgesProps) {
  const showApple = IOS_APP_LIVE && Boolean(IOS_APP_STORE_URL);
  const es = locale === 'es';

  const handleClick = (
    event: MouseEvent<HTMLButtonElement>,
    platform: 'ios' | 'android',
    storeUrl: string
  ) => {
    event.preventDefault();

    const stateParam =
      new URLSearchParams(window.location.search).get('state')?.toLowerCase().trim() || null;
    const finalUrl = buildStoreDownloadUrl(storeUrl, {
      stateParam,
      placement: `${placement}_${platform}`,
    });

    trackAppDownloadClickAndNavigate(
      {
        platform,
        placement: `${placement}_${platform}`,
        stateParam,
      },
      finalUrl
    );
  };

  return (
    <div className={`${mobileOnly ? 'min-[1025px]:hidden' : ''} ${className}`}>
      <p className={labelClassName}>
        {es ? 'Entrena gratis en la app' : 'Start Training Free in the App'}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {showApple ? (
          <button
            type="button"
            onClick={(event) => handleClick(event, 'ios', IOS_APP_STORE_URL)}
            aria-label={
              es ? 'Descarga Forklift Certified en el App Store' : 'Download Forklift Certified on the App Store'
            }
            className="inline-flex appearance-none border-none bg-transparent p-0 cursor-pointer focus:outline-none"
          >
            <img
              src={getStoreBadgeSrc('ios', locale)}
              alt={es ? 'Descárgala en el App Store' : 'Download on the App Store'}
              width={180}
              className="h-[54px] w-auto"
              loading="lazy"
            />
          </button>
        ) : null}
        <button
          type="button"
          onClick={(event) => handleClick(event, 'android', ANDROID_PLAY_STORE_URL)}
          aria-label={
            es ? 'Descarga Forklift Certified en Google Play' : 'Download Forklift Certified on Google Play'
          }
          className="inline-flex appearance-none border-none bg-transparent p-0 cursor-pointer focus:outline-none"
        >
          <img
            src={getStoreBadgeSrc('android', locale)}
            alt={es ? 'Disponible en Google Play' : 'Get it on Google Play'}
            width={180}
            className="h-auto w-[180px]"
            loading="lazy"
          />
        </button>
      </div>
      {/* Static hrefs for crawlers / no-JS clients */}
      <noscript>
        <div className="mt-2 flex flex-col gap-1 text-sm">
          {showApple ? (
            <a href={IOS_APP_STORE_URL}>
              {es ? 'Obtén la app en el App Store' : 'Get the app on the App Store'}
            </a>
          ) : null}
          <a href={ANDROID_PLAY_STORE_URL}>
            {es ? 'Obtén la app en Google Play' : 'Get the app on Google Play'}
          </a>
        </div>
      </noscript>
    </div>
  );
}
