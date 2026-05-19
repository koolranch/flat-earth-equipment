"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n";

const SPANISH_AD_STATES = [
  { code: "texas", name: "Texas", icon: "🤠", mobile: true },
  { code: "florida", name: "Florida", icon: "🌴", mobile: true },
  { code: "arizona", name: "Arizona", icon: "☀️", mobile: true },
  { code: "ohio", name: "Ohio", icon: "🏭", mobile: true },
  { code: "indiana", name: "Indiana", icon: "🏁", mobile: false },
  { code: "pennsylvania", name: "Pennsylvania", icon: "🏛️", mobile: false },
  { code: "georgia", name: "Georgia", icon: "🍑", mobile: false },
  { code: "north carolina", name: "North Carolina", icon: "🌲", mobile: false },
  { code: "tennessee", name: "Tennessee", icon: "🎸", mobile: false },
];

const ENGLISH_STATES = [
  { code: "tx", name: "Texas", icon: "🤠", mobile: true },
  { code: "ca", name: "California", icon: "☀️", mobile: true },
  { code: "fl", name: "Florida", icon: "🌴", mobile: true },
  { code: "ny", name: "New York", icon: "🗽", mobile: true },
  { code: "pa", name: "Pennsylvania", icon: "🏛️", mobile: false },
  { code: "oh", name: "Ohio", icon: "🏭", mobile: false },
  { code: "il", name: "Illinois", icon: "🌆", mobile: false },
  { code: "nc", name: "North Carolina", icon: "🌲", mobile: false },
  { code: "ga", name: "Georgia", icon: "🍑", mobile: false },
  { code: "mi", name: "Michigan", icon: "🚗", mobile: false },
];

export default function SafetyStateLinks({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const states = locale === "es" ? SPANISH_AD_STATES : ENGLISH_STATES;

  function hrefFor(state: (typeof states)[number]) {
    if (locale === "en") return `/safety/forklift/${state.code}`;

    const params = new URLSearchParams(searchParams.toString());
    params.set("state", state.code);
    return `/es/safety?${params.toString()}`;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6 max-w-4xl mx-auto">
      {states.map((state) => (
        <Link
          key={state.code}
          href={hrefFor(state)}
          className={`bg-white hover:bg-orange-50 border border-orange-200 rounded-lg p-3 transition-all hover:shadow-md ${!state.mobile ? "hidden md:block" : ""}`}
        >
          <div className="text-2xl mb-1">{state.icon}</div>
          <div className="text-sm font-medium text-slate-800">{state.name}</div>
        </Link>
      ))}
    </div>
  );
}
