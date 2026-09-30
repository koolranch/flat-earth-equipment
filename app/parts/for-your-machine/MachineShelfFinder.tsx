'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ShelfBrandOption } from '@/lib/parts/machineShelf';

type Labels = {
  brand: string;
  model: string;
  filterModels: string;
  selectBrand: string;
  selectModel: string;
  selectBrandFirst: string;
  noModelMatch: string;
};

type Props = {
  brands: ShelfBrandOption[];
  models: string[];
  modelCounts: Record<string, number>;
  brand: string;
  model: string;
  labels: Labels;
};

function shelfHref(brand: string, model: string): string {
  const params = new URLSearchParams();
  if (brand) params.set('brand', brand);
  if (model) params.set('model', model);
  const query = params.toString();
  return query ? `/parts/for-your-machine?${query}` : '/parts/for-your-machine';
}

export default function MachineShelfFinder({
  brands,
  models,
  modelCounts,
  brand,
  model,
  labels,
}: Props) {
  const router = useRouter();
  const [modelQuery, setModelQuery] = useState('');

  const visibleModels = useMemo(() => {
    const query = modelQuery.trim().toLowerCase();
    if (!query) return models;
    return models.filter((entry) => entry.toLowerCase().includes(query));
  }, [models, modelQuery]);

  function go(nextBrand: string, nextModel: string) {
    setModelQuery('');
    router.push(shelfHref(nextBrand, nextModel));
  }

  return (
    <div className="rounded-2xl bg-slate-950 px-5 py-6 text-white md:px-8 md:py-8">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-300">{labels.brand}</span>
          <select
            value={brand}
            aria-label={labels.brand}
            onChange={(event) => go(event.target.value, '')}
            className="w-full rounded-lg border-0 bg-white px-4 py-3 text-slate-900 min-h-[44px]"
          >
            <option value="">{labels.selectBrand}</option>
            {brands.map((entry) => (
              <option key={entry.name} value={entry.name}>
                {entry.name}
              </option>
            ))}
          </select>
        </label>
        <div className="block text-sm">
          <label htmlFor="machine-model" className="mb-1.5 block font-medium text-slate-300">
            {labels.model}
          </label>
          {models.length > 12 && (
            <input
              value={modelQuery}
              onChange={(event) => setModelQuery(event.target.value)}
              placeholder={labels.filterModels}
              aria-label={labels.filterModels}
              disabled={!brand}
              className="mb-2 w-full rounded-lg border-0 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 disabled:bg-slate-200 disabled:text-slate-400 min-h-[44px]"
            />
          )}
          <select
            id="machine-model"
            value={visibleModels.includes(model) ? model : ''}
            aria-label={labels.model}
            disabled={!brand}
            onChange={(event) => go(brand, event.target.value)}
            className="w-full rounded-lg border-0 bg-white px-4 py-3 text-slate-900 disabled:bg-slate-200 disabled:text-slate-400 min-h-[44px]"
          >
            <option value="">{brand ? labels.selectModel : labels.selectBrandFirst}</option>
            {visibleModels.map((entry) => (
              <option key={entry} value={entry}>
                {modelCounts[entry] ? `${entry} (${modelCounts[entry]})` : entry}
              </option>
            ))}
          </select>
          {brand && modelQuery.trim() && visibleModels.length === 0 && (
            <p className="mt-2 text-sm text-slate-300">{labels.noModelMatch}</p>
          )}
        </div>
      </div>
    </div>
  );
}
