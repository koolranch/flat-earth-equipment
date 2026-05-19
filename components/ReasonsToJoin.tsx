import type { MarketingDict } from "@/i18n";
import { getMarketingDict } from "@/i18n";

export default function ReasonsToJoin({ t = getMarketingDict("en") }: { t?: MarketingDict }) {
  const items = t.safety.reasons.items;
  
  return (
    <section aria-labelledby="reasons" className="mt-8">
      <h2 id="reasons" className="sr-only">{t.safety.reasons.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {items.map((i) => (
          <div 
            key={i.title} 
            className="group rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {i.icon}
            </div>
            <p className="font-bold text-slate-900 text-lg mb-2 tracking-tight">{i.title}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{i.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

