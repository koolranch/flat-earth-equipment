import Link from 'next/link';
import {
  buildCatalogUrl,
  type AvailabilityCounts,
  type CatalogSearchParams,
} from '@/lib/parts/catalogQuery';

type Props = {
  searchParams: CatalogSearchParams;
  counts: AvailabilityCounts;
  labels: {
    buyNow: string;
    inStock: string;
    quoteOnly: string;
    allParts: string;
  };
};

export default function PartsCatalogAvailabilityPills({
  searchParams,
  counts,
  labels,
}: Props) {
  const pills = [
    {
      label: labels.allParts,
      count: counts.total,
      href: buildCatalogUrl(searchParams, {
        sales_type: undefined,
        in_stock: undefined,
      }),
      active: !searchParams.sales_type && !searchParams.in_stock,
    },
    {
      label: labels.inStock,
      count: counts.shipsToday,
      href: buildCatalogUrl(searchParams, { sales_type: 'direct', in_stock: '1' }),
      active: searchParams.sales_type === 'direct' && searchParams.in_stock === '1',
    },
    {
      label: labels.buyNow,
      count: counts.shopOnline,
      href: buildCatalogUrl(searchParams, { sales_type: 'direct', in_stock: undefined }),
      active: searchParams.sales_type === 'direct' && !searchParams.in_stock,
    },
    {
      label: labels.quoteOnly,
      count: counts.quoteOnly,
      href: buildCatalogUrl(searchParams, {
        sales_type: 'quote_only',
        in_stock: undefined,
      }),
      active: searchParams.sales_type === 'quote_only',
    },
  ];

  return (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
      {pills.map((pill) => (
        <Link
          key={pill.label}
          href={pill.href}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            pill.active
              ? 'bg-[#F76511] text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {pill.label}{' '}
          <span className={pill.active ? 'text-orange-100' : 'text-slate-400'}>
            ({pill.count.toLocaleString()})
          </span>
        </Link>
      ))}
    </div>
  );
}
