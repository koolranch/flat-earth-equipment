import Link from 'next/link';
import { CATALOG_QUICK_PATHS } from '@/lib/parts/catalogQuery';

type Props = {
  heading: string;
};

export default function PartsCatalogQuickPaths({ heading }: Props) {
  return (
    <section aria-labelledby="quick-paths-heading" className="mb-8">
      <h2
        id="quick-paths-heading"
        className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500"
      >
        {heading}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOG_QUICK_PATHS.map((path) => (
          <Link
            key={path.href}
            href={path.href}
            className="group flex gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-[#F76511] hover:shadow-sm"
          >
            <span
              className={`mt-0.5 h-10 w-1 shrink-0 rounded-full ${path.accent}`}
              aria-hidden="true"
            />
            <span>
              <p className="font-bold text-slate-900 transition-colors group-hover:text-[#F76511]">
                {path.label}
              </p>
              <p className="text-sm text-slate-500">{path.description}</p>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
