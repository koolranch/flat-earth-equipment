import { PARTS_CATALOG_FAQ } from '@/lib/parts/catalogSeo';

type Props = {
  heading: string;
};

export default function PartsCatalogFaq({ heading }: Props) {
  return (
    <section aria-labelledby="parts-faq-heading" className="mt-12">
      <h2 id="parts-faq-heading" className="mb-4 text-xl font-bold text-slate-900">
        {heading}
      </h2>
      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {PARTS_CATALOG_FAQ.map((item) => (
          <details key={item.q} className="group px-5 py-4">
            <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-4">
                {item.q}
                <span className="text-[#F76511] transition-transform group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
