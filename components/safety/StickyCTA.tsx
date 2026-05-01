"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  IOS_APP_LIVE,
  IOS_APP_STORE_URL,
  buildStoreDownloadUrl,
  detectAppPlatform,
  getStoreUrlForPlatform,
  type AppPlatform,
} from "@/lib/app-store/links";
import { trackAppDownloadClick } from "@/lib/analytics/app-download";

const SCROLL_TRIGGER_PX = 600;
const DISMISS_KEY = "safety_sticky_dismissed";

function StickyCTAInner() {
  const searchParams = useSearchParams();
  const stateParam = (searchParams?.get("state") || "").toLowerCase().trim() || null;

  const [platform, setPlatform] = useState<AppPlatform | null>(null);
  const [showBar, setShowBar] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setPlatform(detectAppPlatform());

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

  const showAppleBadge = platform === "ios" && IOS_APP_LIVE && Boolean(IOS_APP_STORE_URL);
  const targetPlatform: "android" | "ios" = showAppleBadge ? "ios" : "android";
  const storeUrl = getStoreUrlForPlatform(showAppleBadge ? "ios" : "android");
  const finalUrl = buildStoreDownloadUrl(storeUrl, {
    stateParam,
    placement: "safety_sticky",
  });

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    trackAppDownloadClick({
      platform: targetPlatform,
      placement: "safety_sticky",
      stateParam,
    });
    setTimeout(() => {
      window.location.href = finalUrl;
    }, 200);
  };

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-white/10 bg-slate-950/85 backdrop-blur-md text-white shadow-[0_-6px_20px_rgba(0,0,0,0.25)]"
      role="region"
      aria-label="Start free training in the app"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span aria-hidden="true" className="text-lg">🎓</span>
          <span className="truncate text-sm font-semibold">
            Start Training Free
          </span>
        </div>
        <a
          href={finalUrl}
          onClick={handleClick}
          className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 transition-colors"
          aria-label={`Download the app on ${targetPlatform === "ios" ? "the App Store" : "Google Play"}`}
        >
          Download App
        </a>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}

export default function StickyCTA() {
  return (
    <Suspense fallback={null}>
      <StickyCTAInner />
    </Suspense>
  );
}
