'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type FinderGlass = {
  slug: string;
  name: string;
  brand: string;
  models: string[];
  price: number;
  glassType: string;
  glassTypeLabel: string;
  oem: string;
  salesType: 'direct' | 'quote_only' | string;
  inStock: boolean;
};

function humanType(glassType: string): string {
  return glassType
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function GlassFinder({ parts }: { parts: FinderGlass[] }) {
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
      .sort((a, b) => a.glassTypeLabel.localeCompare(b.glassTypeLabel));
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
      <h2 className="text-xl font-bold mb-1">Find cab glass for your machine</h2>
      <p className="text-slate-300 text-sm mb-5">
        Pick brand and model — results include door, windshield, side, rear, and roof
        panels from the fitment catalog.
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
          className="w-full rounded-lg border-0 bg-white px-4 py-3 text-slate-900 disabled:bg-slate-200 disabled:text-slate-400 min-h-[48px]"
        >
          <option value="">{brand ? 'Select model…' : 'Select brand first'}</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {brand && model && (
        <div className="space-y-2">
          {matches.length === 0 ? (
            <p className="text-slate-300 text-sm">
              No cab glass listed for this model yet —{' '}
              <Link
                href={`/quote?equipment=${encodeURIComponent(`${brand} ${model}`)}&notes=${encodeURIComponent('Cab glass request')}`}
                className="underline text-orange-300"
              >
                request a quote
              </Link>{' '}
              and we&apos;ll source the panel.
            </p>
          ) : (
            matches.map((p) => {
              const isBuyNow = p.salesType === 'direct' && p.price > 0;
              return (
                <Link
                  key={p.slug}
                  href={`/parts/${p.slug}`}
                  className="flex items-center justify-between rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-3 transition-colors min-h-[48px]"
                >
                  <div>
                    <p className="font-semibold text-sm">
                      {p.glassTypeLabel || humanType(p.glassType)}
                      {p.oem ? (
                        <span className="font-normal text-slate-300"> · {p.oem}</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-slate-300">
                      {isBuyNow
                        ? 'In stock · Ground surface freight at checkout'
                        : 'Request quote — confirm availability'}
                    </p>
                  </div>
                  <span className="font-bold text-orange-300 whitespace-nowrap ml-4">
                    {isBuyNow ? `$${p.price.toFixed(0)} →` : 'Quote →'}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
