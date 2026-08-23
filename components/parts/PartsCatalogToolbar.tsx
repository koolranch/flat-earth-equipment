'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { PartSuggestion } from '@/app/api/parts/suggest/route';
import {
  buildCatalogUrl,
  type CatalogSearchParams,
  type CatalogSort,
} from '@/lib/parts/catalogQuery';

const MIN_SUGGEST_LENGTH = 3;
const SUGGEST_DEBOUNCE_MS = 180;

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
    suggestQuote: string;
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
  const [suggestions, setSuggestions] = useState<PartSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  // Set when the user picks a suggestion or submits, so the resulting state
  // change doesn't immediately refetch and reopen the panel.
  const suppressFetch = useRef(false);

  useEffect(() => {
    if (suppressFetch.current) {
      suppressFetch.current = false;
      return;
    }

    const term = query.trim();
    if (term.length < MIN_SUGGEST_LENGTH) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/parts/suggest?q=${encodeURIComponent(term)}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const body = (await response.json()) as { suggestions: PartSuggestion[] };
        setSuggestions(body.suggestions);
        setIsOpen(body.suggestions.length > 0);
        setHighlighted(-1);
      } catch {
        // Aborted or offline — leave the previous suggestions in place.
      }
    }, SUGGEST_DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const closePanel = () => {
    suppressFetch.current = true;
    setIsOpen(false);
    setHighlighted(-1);
  };

  const goToPart = (slug: string) => {
    closePanel();
    router.push(`/parts/${slug}`);
  };

  const onSearch = (event: FormEvent) => {
    event.preventDefault();

    if (isOpen && highlighted >= 0 && suggestions[highlighted]) {
      goToPart(suggestions[highlighted].slug);
      return;
    }

    const trimmed = query.trim();
    closePanel();
    router.push(
      buildCatalogUrl(searchParams, { q: trimmed || undefined }, true),
    );
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((index) =>
        index <= 0 ? suggestions.length - 1 : index - 1,
      );
    } else if (event.key === 'Escape') {
      closePanel();
    }
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
        <div ref={containerRef} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setIsOpen(suggestions.length > 0)}
            placeholder={labels.searchPlaceholder}
            className="w-full rounded-xl border-2 border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-[#F76511] focus:outline-none"
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="parts-suggestions"
            aria-autocomplete="list"
            aria-activedescendant={
              highlighted >= 0 ? `parts-suggestion-${highlighted}` : undefined
            }
          />

          {isOpen && suggestions.length > 0 && (
            <ul
              id="parts-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.slug} role="none">
                  <button
                    type="button"
                    id={`parts-suggestion-${index}`}
                    role="option"
                    aria-selected={index === highlighted}
                    onClick={() => goToPart(suggestion.slug)}
                    onMouseEnter={() => setHighlighted(index)}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors ${
                      index === highlighted ? 'bg-slate-100' : 'bg-white'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {suggestion.name}
                      </span>
                      <span className="block truncate font-mono text-[11px] text-slate-500">
                        {suggestion.partNumber}
                        {suggestion.category ? ` · ${suggestion.category}` : ''}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-slate-700">
                      {suggestion.price === null
                        ? labels.suggestQuote
                        : `$${suggestion.price.toFixed(2)}`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
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
