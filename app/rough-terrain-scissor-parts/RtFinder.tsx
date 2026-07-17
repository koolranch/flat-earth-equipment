'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type FinderPart = {
  slug: string;
  name: string;
  brand: string;
  models: string[];
  price: number;
  bucket: string;
  bucketLabel: string;
  oem: string;
  salesType: 'direct' | 'quote_only' | string;
  inStock: boolean;
};

export default function RtFinder({ parts }: { parts: FinderPart[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get('brand') ?? '';
  const initialModel = searchParams.get('model') ?? '';

  const [brand, setBrand] = useState(initialBrand);
  const [model, setModel] = useState(initialModel);

  useEffect(() => {
    setBrand(initialBrand);
    setModel(initialModel);
  }, [initialBrand, initialModel]);

  const brands = useMemo(
    () => Array.from(new Set(parts.map((p) => p.brand))).sort(),
    [parts]
  );

  const models = useMemo(() => {
    if (!brand) return [];
    const set = new Set<string>();
    for (const p of parts) {
      if (p.brand === brand) p.models.forEach((m) => set.add(m));
    }
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [parts, brand]);

  const matches = useMemo(() => {
    if (!brand || !model) return [];
    return parts
      .filter((p) => p.brand === brand && p.models.includes(model))
      .sort((a, b) => a.bucketLabel.localeCompare(b.bucketLabel) || a.name.localeCompare(b.name));
  }, [parts, brand, model]);

  function syncUrl(nextBrand: string, nextModel: string) {
    const params = new URLSearchParams();
    if (nextBrand) params.set('brand', nextBrand);
    if (nextModel) params.set('model', nextModel);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white">
      <h2 className="text-xl font-bold mb-1">Find RT scissor parts by machine</h2>
      <p className="text-slate-300 text-sm mb-5">
        Pick brand and model — results include controllers, switches, relays, alarms,
        and solenoids from the fitment catalog.
      </p>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <select
          value={brand}
          onChange={(e) => {
            const next = e.target.value;
            setBrand(next);
            setModel('');
            syncUrl(next, '');
          }}
          aria-label="Machine brand"
          className="w-full rounded-lg border-0 bg-white px-4 py-3 text-slate-900 min-h-[48px]"
        >
          <option value="">Select brand…</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          value={model}
          onChange={(e) => {
            const next = e.target.value;
            setModel(next);
            syncUrl(brand, next);
          }}
          disabled={!brand}
          aria-label="Machine model"
          className="w-full rounded-lg border-0 bg-white px-4 py-3 text-slate-900 min-h-[48px] disabled:opacity-50"
        >
          <option value="">{brand ? 'Select model…' : 'Choose brand first'}</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {brand && model && (
        <div className="mt-4">
          <p className="text-sm text-slate-300 mb-3">
            {matches.length} part{matches.length === 1 ? '' : 's'} for {brand} {model}
          </p>
          <ul className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
            {matches.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/parts/${p.slug}`}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white/10 hover:bg-white/15 px-4 py-3 min-h-[48px]"
                >
                  <span>
                    <span className="block text-sm font-medium text-white">{p.name}</span>
                    <span className="block text-xs text-slate-300">
                      {p.bucketLabel} · OEM {p.oem}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-orange-300">
                    {p.salesType === 'direct' && p.price > 0
                      ? `$${p.price}`
                      : 'Request quote'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
