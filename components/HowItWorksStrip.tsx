import type { MarketingDict } from "@/i18n";
import { getMarketingDict } from "@/i18n";

interface Step {
  h: string;
  p: string;
  /** Optional mobile-only override for headline + paragraph. */
  mobile?: { h: string; p: string };
}

export default function HowItWorksStrip({ t = getMarketingDict("en") }: { t?: MarketingDict }) {
  const steps = t.safety.howItWorks.steps as Step[];

  return (
    <section aria-labelledby="how" className="mt-12 sm:mt-16 mb-8">
      <h2 id="how" className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-8 sm:mb-12 text-center">{t.safety.howItWorks.title}</h2>
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Connector Line (Desktop) */}
        <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-0.5 bg-slate-200 -z-10" />

        {steps.map((s, index) => (
          <div key={s.h} className="group relative bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 text-center">
            {/* Step Number Badge */}
            <div className="mx-auto w-12 h-12 rounded-full bg-white border-2 border-orange-100 text-orange-600 font-bold flex items-center justify-center mb-4 shadow-sm group-hover:border-orange-500 group-hover:scale-110 transition-all duration-300 z-10">
              {index + 1}
            </div>

            {s.mobile ? (
              <>
                <h3 className="md:hidden text-lg font-bold text-slate-900 mb-2 tracking-tight">{s.mobile.h}</h3>
                <h3 className="hidden md:block text-lg font-bold text-slate-900 mb-2 tracking-tight">{s.h}</h3>
                <p className="md:hidden text-sm text-slate-600 leading-relaxed">{s.mobile.p}</p>
                <p className="hidden md:block text-sm text-slate-600 leading-relaxed">{s.p}</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{s.h}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.p}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
