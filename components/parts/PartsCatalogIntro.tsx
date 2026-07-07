import Link from 'next/link';
import { Search } from 'lucide-react';
import { SERIAL_LOOKUP_SHORTCUTS } from '@/lib/parts/catalogSeo';

type Props = {
  totalCount: number;
  labels: {
    intro: string;
    serialLookup: string;
    partsWord: string;
  };
};

export default function PartsCatalogIntro({ totalCount, labels }: Props) {
  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
        {labels.intro.replace('{count}', totalCount.toLocaleString())}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Search className="h-3.5 w-3.5" />
          {labels.serialLookup}
        </span>
        {SERIAL_LOOKUP_SHORTCUTS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-[#F76511] hover:text-[#F76511]"
          >
            {tool.label}
          </Link>
        ))}
        <Link
          href="/brands"
          className="rounded-full px-2 py-1 text-xs font-medium text-[#F76511] hover:underline"
        >
          All brands →
        </Link>
      </div>
    </section>
  );
}
