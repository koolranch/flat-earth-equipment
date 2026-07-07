'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export type FinderTrack = {
  slug: string;
  name: string;
  brand: string;
  models: string[];
  price: number;
  size: string;
  tread: string;
  inStock: boolean;
  backordered: boolean;
};

export default function TrackFinder({ tracks }: { tracks: FinderTrack[] }) {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  const brands = useMemo(
    () => Array.from(new Set(tracks.map((t) => t.brand))).sort(),
    [tracks]
  );

  const models = useMemo(() => {
    if (!brand) return [];
    const set = new Set<string>();
    for (const t of tracks) {
      if (t.brand === brand) t.models.forEach((m) => set.add(m));
    }
    return Array.from(set).sort();
  }, [tracks, brand]);

  const matches = useMemo(() => {
    if (!brand || !model) return [];
    return tracks.filter((t) => t.brand === brand && t.models.includes(model));
  }, [tracks, brand, model]);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white">
      <h2 className="text-xl font-bold mb-1">Find tracks for your machine</h2>
      <p className="text-slate-300 text-sm mb-5">
        Pick your brand and model — every result is vendor-verified fitment.
      </p>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <select
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setModel('');
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
          onChange={(e) => setModel(e.target.value)}
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
              No tracks listed for this model yet —{' '}
              <Link href={`/quote?equipment=${encodeURIComponent(`${brand} ${model}`)}&notes=${encodeURIComponent('Rubber track request')}`} className="underline text-orange-300">
                request a quote
              </Link>{' '}
              and we&apos;ll source it.
            </p>
          ) : (
            matches.map((t) => (
              <Link
                key={t.slug}
                href={`/parts/${t.slug}`}
                className="flex items-center justify-between rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-3 transition-colors"
              >
                <div>
                  <p className="font-semibold text-sm">
                    {t.size.replace(/x/gi, '×')} — {t.tread}
                  </p>
                  <p className="text-xs text-slate-300">
                    {t.backordered
                      ? 'Backordered — contact us to confirm availability'
                      : 'In stock · Free shipping · 2-year warranty'}
                  </p>
                </div>
                <span className="font-bold text-orange-300 whitespace-nowrap ml-4">
                  ${t.price.toFixed(0)}/ea →
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
