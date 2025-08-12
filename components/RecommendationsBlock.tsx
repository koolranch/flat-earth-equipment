"use client";
import { useEffect, useMemo, useState } from 'react';
import type { RecommendInput, RecommendedPart } from '@/types/recommendations';
import { fetchRecommendations } from '@/lib/fetchRecommendations';
import RecommendedChargerCard from '@/components/RecommendedChargerCard';
import RecommendationInfo from '@/components/RecommendationInfo';

export default function RecommendationsBlock({ filters, fallbackItems }: { filters: RecommendInput; fallbackItems: any[] }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RecommendedPart[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(() => ({ ...filters, limit: 12 }), [filters]); // Increased limit for both tiers

  useEffect(() => {
    let ignore = false; const ctl = new AbortController();
    async function run() {
      setLoading(true); setError(null);
      const res = await fetchRecommendations(payload, ctl.signal);
      if (ignore) return;
      if (res.ok) setItems(res.items as any);
      else setError(res.error || 'Error');
      setLoading(false);
    }
    run();
    return () => { ignore = true; ctl.abort(); };
  }, [payload]);

  // Process items and fallback with matchType
  const processedItems = useMemo(() => {
    if (items && items.length) {
      return items;
    }
    // Convert fallback items to have matchType
    return (fallbackItems || []).slice(0, 8).map((p: any) => ({
      id: p.id, 
      slug: p.slug, 
      name: p.name, 
      image_url: p.image_url, 
      price: p.price, 
      price_cents: p.price_cents, 
      stripe_price_id: p.stripe_price_id, 
      sku: p.sku, 
      score: 0, 
      reasons: [{ label: 'Closest available match' }], 
      fallback: true,
      matchType: 'alternate' as const
    }));
  }, [items, fallbackItems]);

  // Group items by match type
  const { bestMatches, alternateOptions } = useMemo(() => {
    const best = processedItems.filter(item => item.matchType === 'best');
    const alternate = processedItems.filter(item => item.matchType === 'alternate');
    
    return {
      bestMatches: best,
      alternateOptions: alternate
    };
  }, [processedItems]);

  return (
    <section className="mt-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Battery Charger Results</h2>
        <RecommendationInfo />
      </div>
      
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="rounded-2xl border bg-white p-4 h-48 animate-pulse" />))}
        </div>
      )}
      
      {!loading && processedItems.length > 0 && (
        <div className="space-y-8">
          {/* Best Matches Section */}
          {bestMatches.length > 0 && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">Best Match</h3>
                <p className="text-sm text-neutral-600">
                  These chargers match your voltage, charge speed, and phase exactly.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bestMatches.map((item) => (
                  <RecommendedChargerCard key={item.slug} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Alternate Options Section */}
          {alternateOptions.length > 0 && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">Alternate Options</h3>
                <p className="text-sm text-neutral-600">
                  Close alternatives that may differ slightly in amperage or phase.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {alternateOptions.map((item) => (
                  <RecommendedChargerCard key={item.slug} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!loading && processedItems.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-center text-neutral-600">
          No recommendations yet. Adjust your selections or request a quote and we'll confirm compatibility.
        </div>
      )}
      
      {error && (
        <p className="mt-3 text-xs text-amber-700">
          {error === 'RECS_DISABLED' ? 'Recommendations are temporarily disabled.' : 'We had trouble generating recommendations.'}
        </p>
      )}
    </section>
  );
}
