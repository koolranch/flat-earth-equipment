"use client";
import { useEffect, useMemo, useState } from 'react';
import type { RecommendInput, RecommendedPart } from '@/types/recommendations';
import { fetchRecommendations } from '@/lib/fetchRecommendations';
import RecommendedChargerCard from '@/components/RecommendedChargerCard';

export default function RecommendationsBlock({ filters, fallbackItems }: { filters: RecommendInput; fallbackItems: any[] }){
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RecommendedPart[]|null>(null);
  const [error, setError] = useState<string|null>(null);

  const payload = useMemo(() => {
    return {
      voltage: filters.voltage,
      amps: filters.amps,
      phase: filters.phase,
      chemistry: filters.chemistry,
      limit: 12
    };
  }, [filters.voltage, filters.amps, filters.phase, filters.chemistry]);

  useEffect(() => {
    // Skip empty requests
    if (!payload.voltage && !payload.amps) {
      setItems(null);
      setLoading(false);
      setError(null);
      return;
    }

    let ignore = false;
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetchRecommendations(payload, controller.signal);
        
        if (ignore) return;
        
        if (res.ok) {
          setItems(res.items);
        } else {
          setError(res.error || 'Error loading recommendations');
        }
      } catch (err: any) {
        if (!ignore && err?.name !== 'AbortError') {
          setError('Failed to load recommendations');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
      controller.abort();
    };
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
        <div className="mt-6">
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                ✓
              </div>
              <div>
                <h2 className="text-lg font-semibold text-green-900">Best Match ({best.length} {best.length === 1 ? 'charger' : 'chargers'})</h2>
                <p className="text-sm text-green-700">Perfect matches for your {payload.voltage}V battery with optimal amperage and phase compatibility</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {best.map((it) => (<RecommendedChargerCard key={it.slug} item={it} />))}
          </div>
        </div>
      )}
      {!loading && alt.length > 0 && (
        <div className="mt-10">
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                ~
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Alternate Options ({alt.length} {alt.length === 1 ? 'charger' : 'chargers'})</h3>
                <p className="text-sm text-blue-700">Compatible chargers that may have different amperage or power input requirements</p>
              </div>
            </div>
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