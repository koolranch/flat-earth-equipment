/**
 * Trust Signal Strip
 * Social proof metrics instead of trademark-sensitive logos
 */

import type { MarketingDict } from "@/i18n";
import { getMarketingDict } from "@/i18n";

export default function LogoCloud({ t = getMarketingDict("en") }: { t?: MarketingDict }) {
  const stats = t.safety.stats;
  return (
    <section className="py-6 border-y border-slate-100 bg-slate-50/50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm font-medium text-slate-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

