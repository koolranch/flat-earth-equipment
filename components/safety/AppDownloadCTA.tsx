"use client";

import { useEffect, useState } from "react";
import {
  ANDROID_PLAY_STORE_URL,
  APPLE_BADGE_SRC,
  IOS_APP_LIVE,
  IOS_APP_STORE_URL,
  PLAY_BADGE_SRC,
  buildStoreDownloadUrl,
  detectAppPlatform,
  getStoreUrlForPlatform,
  type AppPlatform,
} from "@/lib/app-store/links";
import { trackAppDownloadClick } from "@/lib/analytics/app-download";

interface AppDownloadCTAProps {
  /** Where this CTA is rendered. Used in tracking so we can split conversions. */
  placement?: string;
  /** Lowercased state slug from the `?state=` query param, or null. */
  stateParam?: string | null;
  /** Optional extra classes for the outer wrapper. */
  className?: string;
  /** Optional extra classes for the primary button. */
  buttonClassName?: string;
  /** Override the primary button label. */
  primaryLabel?: string;
  /** Show a small "Or buy now on web — $49" secondary link below the badge. */
  showWebFallback?: boolean;
  /** Show the labeled trust line ("Train free • Pay $49 only when ready"). */
  showTrustLine?: boolean;
  /**
   * Layout style. `stacked` shows a button + badge below it; `inline` is a
   * compact horizontal version for the sticky bottom bar.
   */
  variant?: "stacked" | "inline";
}

const DEFAULT_PRIMARY_LABEL = "Start Training Free";

export default function AppDownloadCTA({
  placement = "safety_page",
  stateParam = null,
  className = "",
  buttonClassName = "",
  primaryLabel = DEFAULT_PRIMARY_LABEL,
  showWebFallback = true,
  showTrustLine = true,
  variant = "stacked",
}: AppDownloadCTAProps) {
  const [platform, setPlatform] = useState<AppPlatform | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPlatform(detectAppPlatform());
    setMounted(true);
  }, []);

  const isIOSDevice = platform === "ios";
  const showApplePadge = isIOSDevice && IOS_APP_LIVE && Boolean(IOS_APP_STORE_URL);
  const targetPlatform: "android" | "ios" = showApplePadge ? "ios" : "android";

  const storeUrl = getStoreUrlForPlatform(showApplePadge ? "ios" : "android");
  const finalUrl = buildStoreDownloadUrl(storeUrl, {
    stateParam,
    placement,
  });

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!mounted) return;
    event.preventDefault();
    trackAppDownloadClick({
      platform: targetPlatform,
      placement,
      stateParam,
    });
    setTimeout(() => {
      window.location.href = finalUrl;
    }, 200);
  };

  const buttonBaseClasses =
    "group inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-8 py-4 md:px-10 md:py-5 font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_8px_rgba(249,115,22,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(249,115,22,0.3)] active:scale-95 active:shadow-sm";

  if (variant === "inline") {
    return (
      <a
        href={finalUrl}
        onClick={handleClick}
        className={`${buttonBaseClasses} ${buttonClassName} ${className}`}
        aria-label={`${primaryLabel} on ${targetPlatform === "ios" ? "the App Store" : "Google Play"}`}
      >
        <span className="text-base tracking-tight">{primaryLabel}</span>
      </a>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 md:items-start ${className}`}>
      <a
        href={finalUrl}
        onClick={handleClick}
        className={`${buttonBaseClasses} w-full max-w-sm md:w-auto ${buttonClassName}`}
        aria-label={`${primaryLabel} on ${targetPlatform === "ios" ? "the App Store" : "Google Play"}`}
      >
        <span className="text-lg md:text-xl tracking-tight">{primaryLabel}</span>
      </a>

      <a
        href={finalUrl}
        onClick={handleClick}
        className="inline-flex"
        aria-label={`Get the app on ${targetPlatform === "ios" ? "the App Store" : "Google Play"}`}
      >
        {showApplePadge ? (
          <img
            src={APPLE_BADGE_SRC}
            alt="Download on the App Store"
            width={180}
            className="h-[54px] w-auto"
            loading="lazy"
          />
        ) : (
          <img
            src={PLAY_BADGE_SRC}
            alt={
              isIOSDevice
                ? "Available on Android — Get it on Google Play"
                : "Get it on Google Play"
            }
            width={180}
            className="h-auto w-[180px]"
            loading="lazy"
          />
        )}
      </a>

      {isIOSDevice && !IOS_APP_LIVE && (
        <p className="text-xs text-slate-300 md:text-slate-400">
          Available on Android today — iOS coming soon.
        </p>
      )}

      {showTrustLine && (
        <p className="text-sm text-slate-300 md:text-slate-400">
          Train free in the app. Pay $49 only when you&rsquo;re ready for the
          certificate.
        </p>
      )}

      {showWebFallback && (
        <a
          href="/safety#pricing"
          className="text-sm font-medium text-orange-300 hover:text-orange-200 underline underline-offset-2"
        >
          Or buy now on web — $49 →
        </a>
      )}

      {/* Hidden link helps non-JS clients still reach the store. */}
      <noscript>
        <a href={ANDROID_PLAY_STORE_URL} className="sr-only">
          Get the app on Google Play
        </a>
      </noscript>
    </div>
  );
}
