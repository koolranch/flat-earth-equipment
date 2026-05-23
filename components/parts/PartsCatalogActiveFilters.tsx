import Link from 'next/link';
import type { ActiveFilter } from '@/lib/parts/catalogContext';

type Props = {
  filters: ActiveFilter[];
  clearLabel: string;
};

export default function PartsCatalogActiveFilters({ filters, clearLabel }: Props) {
  if (filters.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <Link
          key={filter.key}
          href={filter.href}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-medium text-[#F76511] transition-colors hover:bg-orange-100"
        >
          {filter.label}
          <span aria-hidden="true">×</span>
        </Link>
      ))}
      {filters.length > 1 && (
        <Link href="/parts" className="text-sm font-medium text-slate-500 hover:text-[#F76511]">
          {clearLabel}
        </Link>
      )}
    </div>
  );
}
