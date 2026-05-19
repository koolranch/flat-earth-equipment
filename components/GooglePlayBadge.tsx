'use client';

import type { MouseEvent } from 'react';
import { ANDROID_PLAY_STORE_URL, buildStoreDownloadUrl, getStoreBadgeSrc } from '@/lib/app-store/links';
import {
  trackAppDownloadClickAndNavigate,
} from '@/lib/analytics/app-download';

interface GooglePlayBadgeProps {
  className?: string;
  labelClassName?: string;
  placement?: string;
  locale?: 'en' | 'es';
}

export default function GooglePlayBadge({
  className = '',
  labelClassName = 'text-sm font-semibold text-slate-700',
  placement = 'footer_badge',
  locale = 'en',
}: GooglePlayBadgeProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const stateParam = new URLSearchParams(window.location.search).get('state')?.toLowerCase().trim() || null;
    const finalUrl = buildStoreDownloadUrl(ANDROID_PLAY_STORE_URL, {
      stateParam,
      placement,
    });

    trackAppDownloadClickAndNavigate({
      platform: 'android',
      placement,
      stateParam,
    }, finalUrl);
  };

  return (
    <div className={`min-[1025px]:hidden ${className}`}>
      <p className={labelClassName}>{locale === 'es' ? 'Entrena gratis en Android' : 'Start Training Free on Android'}</p>
      <button
        type="button"
        onClick={handleClick}
        aria-label={locale === 'es' ? 'Descarga Forklift Certified en Google Play' : 'Download Forklift Certified on Google Play'}
        className="inline-flex appearance-none border-none bg-transparent p-0 cursor-pointer focus:outline-none"
      >
        <img
          src={getStoreBadgeSrc('android', locale)}
          alt={locale === 'es' ? 'Disponible en Google Play' : 'Get it on Google Play'}
          width={180}
          className="h-auto w-[180px]"
          loading="lazy"
        />
      </button>
    </div>
  );
}
