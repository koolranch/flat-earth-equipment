"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { trackWebCheckoutInitiated } from "@/lib/analytics/gtag";
import { createTrainingCheckoutSessionFromForm } from "@/app/training/checkout/actions";
import { TRAINING_PLANS } from "@/lib/training/plans";
import ClickIdsHiddenInput from "@/components/checkout/ClickIdsHiddenInput";
import FunnelStateHiddenInput from "@/components/checkout/FunnelStateHiddenInput";
import type { Locale, MarketingDict } from "@/i18n";
import { getMarketingDict } from "@/i18n";
import type { SafetyTrafficSource } from "@/lib/safety/traffic-source";

const SCROLL_TRIGGER_PX = 600;
const DISMISS_KEY = "safety_sticky_dismissed";

function StickyCTAInner({
  locale = "en",
  t,
  trafficSource = "organic",
}: {
  locale?: Locale;
  t?: MarketingDict;
  trafficSource?: SafetyTrafficSource;
}) {
  const dict = t || getMarketingDict(locale);
  const copy = dict.safety.sticky;
  const searchParams = useSearchParams();
  const stateParam = (searchParams?.get("state") || "").toLowerCase().trim() || null;
  const isAdTraffic = trafficSource === "ad";

  const [showBar, setShowBar] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
        return;
      }
    } catch {}

    const onScroll = () => {
      setShowBar(window.scrollY > SCROLL_TRIGGER_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (dismissed || !showBar) return null;

  const referralCode = searchParams?.get("ref");
  const requestId = searchParams?.get("request_id");
  const prefillEmail = searchParams?.get("prefill_email");
  const checkoutSource = isAdTraffic
    ? locale === "es"
      ? "safety_sticky_ad_es"
      : "safety_sticky_ad"
    : locale === "es"
      ? "safety_sticky_organic_es"
      : "safety_sticky_organic";

  // Web-checkout-first for ad + organic (margin + Google Ads attribution).
  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-white/10 bg-slate-950/85 backdrop-blur-md text-white shadow-[0_-6px_20px_rgba(0,0,0,0.25)]"
      role="region"
      aria-label={copy.webText}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span aria-hidden="true" className="text-lg">🎓</span>
          <span className="truncate text-sm font-semibold">
            {copy.webText}
          </span>
        </div>
        <form action={createTrainingCheckoutSessionFromForm}>
          <input type="hidden" name="priceId" value={TRAINING_PLANS.single.priceId} />
          {referralCode && <input type="hidden" name="referralCode" value={referralCode} />}
          {process.env.NEXT_PUBLIC_ENABLE_ASK_EMPLOYER_CHECKOUT === "1" && requestId && (
            <input type="hidden" name="requestId" value={requestId} />
          )}
          {process.env.NEXT_PUBLIC_ENABLE_ASK_EMPLOYER_CHECKOUT === "1" && prefillEmail && (
            <input type="hidden" name="prefillEmail" value={prefillEmail} />
          )}
          <ClickIdsHiddenInput />
          <FunnelStateHiddenInput />
          <button
            type="submit"
            onClick={() => {
              trackWebCheckoutInitiated({
                source: checkoutSource,
                priceId: TRAINING_PLANS.single.priceId,
                state: stateParam,
                value: TRAINING_PLANS.single.price,
              });
            }}
            className="inline-flex min-h-[44px] appearance-none items-center justify-center rounded-lg border-none bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 transition-colors cursor-pointer focus:outline-none"
          >
            {copy.webButton}
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            try {
              window.sessionStorage.setItem(DISMISS_KEY, "1");
            } catch {}
            setDismissed(true);
          }}
          aria-label={copy.dismiss}
          className="ml-1 inline-flex h-11 w-11 min-w-11 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}

export default function StickyCTA({
  locale = "en",
  t,
  trafficSource = "organic",
}: {
  locale?: Locale;
  t?: MarketingDict;
  trafficSource?: SafetyTrafficSource;
}) {
  return (
    <Suspense fallback={null}>
      <StickyCTAInner locale={locale} t={t} trafficSource={trafficSource} />
    </Suspense>
  );
}
