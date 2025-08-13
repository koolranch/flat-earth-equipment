"use client";
import { useEffect, useMemo, useState } from 'react';
import type { RecommendInput, RecommendedPart } from '@/types/recommendations';
import { fetchRecommendations } from '@/lib/fetchRecommendations';
import RecommendedChargerCard from '@/components/RecommendedChargerCard';

export default function RecommendationsBlock({ filters, fallbackItems }: { filters: RecommendInput; fallbackItems: any[] }){
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RecommendedPart[]|null>(null);
  const [error, setError] = useState<string|null>(null);

  const payload = useMemo(()=> ({ ...filters, limit: 12 }), [filters]);

  useEffect(()=>{
    let ignore=false; const ctl = new AbortController();
    (async()=>{
      setLoading(true); setError(null);
      const res = await fetchRecommendations(payload, ctl.signal);
      if (ignore) return;
      if (res.ok) setItems(res.items as any); else setError(res.error || 'Error');
      setLoading(false);
    })();
    return ()=>{ ignore=true; ctl.abort(); };
  }, [payload]);

  const arr = items ?? [];
  const best = arr.filter(i => i.matchType === 'best');
  const alt  = arr.filter(i => i.matchType !== 'best');
  const nothing = !loading && best.length === 0 && alt.length === 0 && (!fallbackItems || fallbackItems.length === 0);

  return (
    <section className="mt-6">
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i)=> (<div key={i} className="h-48 rounded-2xl border bg-white p-4 animate-pulse"/>))}
        </div>
      )}
      {!loading && best.length > 0 && (
        <div className="mt-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Best Match</h2>
            <span className="text-xs text-neutral-500">Exact/near match to your voltage, charge speed and phase.</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {best.map((it) => (<RecommendedChargerCard key={it.slug} item={it} />))}
          </div>
        </div>
      )}
      {!loading && alt.length > 0 && (
        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-semibold">Alternate Options</h3>
            <span className="text-xs text-neutral-500">Close alternatives that may differ slightly in amperage or phase.</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alt.map((it) => (<RecommendedChargerCard key={it.slug} item={it} />))}
          </div>
        </div>
      )}
      {nothing && (
        <p className="mt-3 text-xs text-amber-700 text-center">No compatible chargers found. Try adjusting speed or phase, or request a quote.</p>
      )}
      {error && <p className="mt-2 text-xs text-amber-700 text-center">{error}</p>}
    </section>
  );
}