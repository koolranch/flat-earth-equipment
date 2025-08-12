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

  const payload = useMemo(() => ({ ...filters, limit: 12 }), [filters]);

  useEffect(() => {
    let ignore = false; 
    const ctl = new AbortController();
    
    async function run() {
      setLoading(true); 
      setError(null);
      const res = await fetchRecommendations(payload, ctl.signal);
      if (ignore) return;
      if (res.ok) {
        setItems(res.items as any);
      } else {
        setError(res.error || 'Error');
      }
      setLoading(false);
    }
    
    run();
    return () => { 
      ignore = true; 
      ctl.abort(); 
    };
  }, [payload]);

  // Group items by match type from API response
  const { bestMatches, alternateOptions } = useMemo(() => {
    if (items && items.length) {
      const best = items.filter(item => item.matchType === 'best');
      const alternate = items.filter(item => item.matchType === 'alternate');
      return { bestMatches: best, alternateOptions: alternate };
    }

    // Fallback items are all tagged as alternate
    const processedFallbacks = (fallbackItems || []).slice(0, 8).map((p: any) => ({
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

    return { bestMatches: [], alternateOptions: processedFallbacks };
  }, [items, fallbackItems]);

  const hasAnyResults = bestMatches.length > 0 || alternateOptions.length > 0;

  return (
    <section className="mt-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Battery Charger Results</h2>
        <RecommendationInfo />
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl border bg-white p-4 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && hasAnyResults && (
        <div className="space-y-8">
          {/* Best Matches Section */}
          {bestMatches.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Best Match</h2>
                <span className="text-xs text-neutral-500">Exact/near match to your voltage, charge speed and phase.</span>
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
            <div className={bestMatches.length > 0 ? "mt-8" : ""}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-neutral-900">Alternate Options</h3>
                <span className="text-xs text-neutral-500">Close alternatives that may differ slightly in amperage or phase.</span>
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

      {/* Only show disabled notice when there are truly no results */}
      {!loading && !hasAnyResults && (
        <div className="rounded-2xl border bg-white p-8 text-center text-neutral-600">
          <p>No recommendations available. Adjust your selections or request a quote and we'll confirm compatibility.</p>
        </div>
      )}

      {/* Show error only if API failed and there's an error message */}
      {error && error !== 'RECS_DISABLED' && (
        <p className="mt-3 text-xs text-amber-700 text-center">
          We had trouble generating recommendations. Showing closest available matches.
        </p>
      )}
    </section>
  );
}