'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createTrainingCheckoutSessionFromForm } from '@/app/training/checkout/actions';
import { TRAINING_PLANS } from '@/lib/training/plans';
import ClickIdsHiddenInput from '@/components/checkout/ClickIdsHiddenInput';
import { trackWebCheckoutInitiated } from '@/lib/analytics/gtag';
import { getMarketingDict } from '@/i18n';

const SCROLL_TRIGGER_PX = 600;
const DISMISS_KEY = 'state_sticky_dismissed';

export default function StickyCTA() {
  const params = useParams() as Record<string, string> | null;
  const slug = (params?.state || params?.slug || '').toLowerCase();
  const dict = getMarketingDict('en');
  const copy = dict.safety.sticky;

  const [showBar, setShowBar] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === '1') {
        setDismissed(true);
        return;
      }
    } catch {}

    const onScroll = () => {
      setShowBar(window.scrollY > SCROLL_TRIGGER_PX);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {}
    setDismissed(true);
  };

  if (dismissed || !showBar) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/85 md:hidden"
      role="region"
      aria-label={copy.webText}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span aria-hidden="true" className="text-lg">
            🎓
          </span>
          <span className="truncate text-sm font-semibold text-white">{copy.webText}</span>
        </div>
        <form action={createTrainingCheckoutSessionFromForm}>
          <input type="hidden" name="priceId" value={TRAINING_PLANS.single.priceId} />
          <ClickIdsHiddenInput />
          <button
            type="submit"
            onClick={() => {
              trackWebCheckoutInitiated({
                source: 'state_sticky_organic',
                priceId: TRAINING_PLANS.single.priceId,
                state: slug,
                value: TRAINING_PLANS.single.price,
              });
            }}
            className="inline-flex min-h-[44px] appearance-none items-center justify-center rounded-lg border-none bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-orange-600 focus:outline-none"
          >
            {copy.webButton}
          </button>
        </form>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={copy.dismiss}
          className="ml-1 inline-flex h-11 w-11 min-w-11 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
