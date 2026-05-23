import Link from 'next/link';
import { CATALOG_QUICK_PATHS } from '@/lib/parts/catalogQuery';

type Props = {
  heading: string;
};

export default function PartsCatalogQuickPaths({ heading }: Props) {
  return (
    <section aria-labelledby="quick-paths-heading" className="mt-12">
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
            className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-[#F76511] hover:shadow-sm"
          >
            <p className="font-bold text-slate-900">{path.label}</p>
            <p className="text-sm text-slate-500">{path.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
