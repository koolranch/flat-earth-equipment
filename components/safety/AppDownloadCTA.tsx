"use client";

import { useEffect, useState } from "react";
import { createTrainingCheckoutSessionFromForm } from "@/app/training/checkout/actions";
import { TRAINING_PLANS } from "@/lib/training/plans";
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
import {
  trackAppDownloadClickAndNavigate,
} from "@/lib/analytics/app-download";

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
  /** Hide the primary orange app CTA and render only badges/fallback copy. */
  showPrimaryButton?: boolean;
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
const singleOperatorPlan = TRAINING_PLANS.single;

interface CheckoutParams {
  referralCode: string | null;
  requestId: string | null;
  prefillEmail: string | null;
}

export default function AppDownloadCTA({
  placement = "safety_page",
  stateParam = null,
  className = "",
  buttonClassName = "",
  primaryLabel = DEFAULT_PRIMARY_LABEL,
  showPrimaryButton = true,
  showWebFallback = true,
  showTrustLine = true,
  variant = "stacked",
}: AppDownloadCTAProps) {
  const [platform, setPlatform] = useState<AppPlatform | null>(null);
  const [checkoutParams, setCheckoutParams] = useState<CheckoutParams>({
    referralCode: null,
    requestId: null,
    prefillEmail: null,
  });

  useEffect(() => {
    setPlatform(detectAppPlatform());

    const params = new URLSearchParams(window.location.search);
    setCheckoutParams({
      referralCode: params.get("ref"),
      requestId: params.get("request_id"),
      prefillEmail: params.get("prefill_email"),
    });
  }, []);

  const isIOSDevice = platform === "ios";
  const showApplePadge = isIOSDevice && IOS_APP_LIVE && Boolean(IOS_APP_STORE_URL);
  const targetPlatform: "android" | "ios" = showApplePadge ? "ios" : "android";

  const storeUrl = getStoreUrlForPlatform(showApplePadge ? "ios" : "android");
  const finalUrl = buildStoreDownloadUrl(storeUrl, {
    stateParam,
    placement,
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    trackAppDownloadClickAndNavigate({
      platform: targetPlatform,
      placement,
      stateParam,
    }, finalUrl);
  };

  const renderStoreBadgeButton = (
    platformName: "ios" | "android",
    url: string,
    placementSuffix: string,
    className = "inline-flex appearance-none border-none bg-transparent p-0 cursor-pointer focus:outline-none"
  ) => {
    const badgeUrl = buildStoreDownloadUrl(url, {
      stateParam,
      placement: placementSuffix,
    });

    const onBadgeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      trackAppDownloadClickAndNavigate({
        platform: platformName,
        placement: placementSuffix,
        stateParam,
      }, badgeUrl);
    };

    return (
      <button
        type="button"
        onClick={onBadgeClick}
        className={className}
        aria-label={`Get the app on ${platformName === "ios" ? "the App Store" : "Google Play"}`}
      >
        {platformName === "ios" ? (
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
      </button>
    );
  };

  const webCheckoutButton = showWebFallback ? (
    <form action={createTrainingCheckoutSessionFromForm} className="w-full max-w-sm md:w-auto">
      <input type="hidden" name="priceId" value={singleOperatorPlan.priceId} />
      {checkoutParams.referralCode && (
        <input type="hidden" name="referralCode" value={checkoutParams.referralCode} />
      )}
      {process.env.NEXT_PUBLIC_ENABLE_ASK_EMPLOYER_CHECKOUT === "1" && checkoutParams.requestId && (
        <input type="hidden" name="requestId" value={checkoutParams.requestId} />
      )}
      {process.env.NEXT_PUBLIC_ENABLE_ASK_EMPLOYER_CHECKOUT === "1" && checkoutParams.prefillEmail && (
        <input type="hidden" name="prefillEmail" value={checkoutParams.prefillEmail} />
      )}
      <button
        type="submit"
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-orange-300 underline underline-offset-2 transition-colors hover:text-orange-200 md:w-auto"
      >
        Or buy now on web — $49 →
      </button>
    </form>
  ) : null;

  const buttonBaseClasses =
    "group inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-8 py-4 md:px-10 md:py-5 font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_8px_rgba(249,115,22,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(249,115,22,0.3)] active:scale-95 active:shadow-sm";

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`${buttonBaseClasses} ${buttonClassName} ${className} border-0 cursor-pointer`}
        aria-label={`${primaryLabel} on ${targetPlatform === "ios" ? "the App Store" : "Google Play"}`}
      >
        <span className="text-base tracking-tight">{primaryLabel}</span>
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 md:items-start ${className}`}>
      {showPrimaryButton && (
        <button
          type="button"
          onClick={handleClick}
          className={`${buttonBaseClasses} w-full max-w-sm md:w-auto ${buttonClassName} border-0 cursor-pointer`}
          aria-label={`${primaryLabel} on ${targetPlatform === "ios" ? "the App Store" : "Google Play"}`}
        >
          <span className="text-lg md:text-xl tracking-tight">{primaryLabel}</span>
        </button>
      )}

      <div className="flex flex-col items-center gap-3 md:flex-row md:items-center">
        <div className="md:hidden">
          {renderStoreBadgeButton(targetPlatform, finalUrl, placement)}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {IOS_APP_LIVE && IOS_APP_STORE_URL
            ? renderStoreBadgeButton("ios", IOS_APP_STORE_URL, `${placement}_ios`)
            : null}
          {renderStoreBadgeButton("android", ANDROID_PLAY_STORE_URL, `${placement}_android`)}
        </div>
      </div>

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

      {webCheckoutButton}

      {/* Hidden link helps non-JS clients still reach the store. */}
      <noscript>
        <a href={ANDROID_PLAY_STORE_URL} className="sr-only">
          Get the app on Google Play
        </a>
      </noscript>
    </div>
  );
}
