"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Locale, MarketingDict } from "@/i18n";

export default function SafetyLanguageToggle({
  locale,
  t,
}: {
  locale: Locale;
  t: MarketingDict;
}) {
  const searchParams = useSearchParams();
  const targetBase = t.safety.languageToggle.href;
  const query = searchParams.toString();
  const href = query ? `${targetBase}?${query}` : targetBase;

  return (
    <div className="absolute right-4 top-4 z-20">
      <Link
        href={href}
        aria-label={t.safety.languageToggle.label}
        className="inline-flex min-h-[36px] items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
      >
        <span className={locale === "en" ? "text-white" : "text-white/60"}>EN</span>
        <span className="mx-1 text-white/40">|</span>
        <span className={locale === "es" ? "text-white" : "text-white/60"}>ES</span>
      </Link>
    </div>
  );
}
