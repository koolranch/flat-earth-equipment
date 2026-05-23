'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import {
  buildCatalogUrl,
  type CatalogSearchParams,
  type CatalogSort,
} from '@/lib/parts/catalogQuery';

type Props = {
  searchParams: CatalogSearchParams;
  totalCount: number;
  showingFrom: number;
  showingTo: number;
  labels: {
    searchPlaceholder: string;
    searchButton: string;
    sortLabel: string;
    showing: string;
    of: string;
    parts: string;
    filters: string;
    sortRecommended: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortName: string;
  };
};

export default function PartsCatalogToolbar({
  searchParams,
  totalCount,
  showingFrom,
  showingTo,
  labels,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.q ?? '');

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(
      buildCatalogUrl(searchParams, { q: trimmed || undefined }, true),
    );
  };

  const onSortChange = (sort: CatalogSort) => {
    router.push(
      buildCatalogUrl(
        searchParams,
        { sort: sort === 'recommended' ? undefined : sort },
        true,
      ),
    );
  };

  const currentSort = searchParams.sort ?? 'recommended';

  return (
    <div className="mb-6 space-y-4">
      <form onSubmit={onSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="w-full rounded-xl border-2 border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-[#F76511] focus:outline-none"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-[#F76511] px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-600"
        >
          {labels.searchButton}
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {totalCount > 0 ? (
          <p className="text-sm text-slate-600">
            {labels.showing} {showingFrom}–{showingTo} {labels.of}{' '}
            {totalCount.toLocaleString()} {labels.parts}
          </p>
        ) : (
          <p className="text-sm text-slate-600">0 {labels.parts}</p>
        )}

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400 lg:hidden" />
          <label htmlFor="parts-sort" className="sr-only">
            {labels.sortLabel}
          </label>
          <select
            id="parts-sort"
            value={currentSort}
            onChange={(event) => onSortChange(event.target.value as CatalogSort)}
            className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-[#F76511] focus:outline-none"
          >
            <option value="recommended">{labels.sortRecommended}</option>
            <option value="price_asc">{labels.sortPriceAsc}</option>
            <option value="price_desc">{labels.sortPriceDesc}</option>
            <option value="name">{labels.sortName}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
