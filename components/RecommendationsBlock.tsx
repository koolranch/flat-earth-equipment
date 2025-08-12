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

  const payload = useMemo(() => ({ ...filters, limit: 6 }), [filters]);

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

  const showing = items && items.length ? items : (fallbackItems || []).slice(0,6).map((p: any) => ({
    id: p.id, slug: p.slug, name: p.name, image_url: p.image_url, price: p.price, price_cents: p.price_cents, stripe_price_id: p.stripe_price_id, sku: p.sku, score: 0, reasons: [{ label: 'Closest available match' }], fallback: true
  }));

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Recommended Chargers</h2>
        <RecommendationInfo />
      </div>
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="rounded-2xl border bg-white p-4 h-48 animate-pulse" />))}
        </div>
      )}
      {!loading && showing && showing.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showing.map((it) => (<RecommendedChargerCard key={it.slug} item={it as any} />))}
        </div>
      )}
      {!loading && (!showing || showing.length === 0) && (
        <div className="rounded-2xl border bg-white p-8 text-center text-neutral-600">No recommendations yet. Adjust your selections or request a quote and we'll confirm compatibility.</div>
      )}
      {error && <p className="mt-3 text-xs text-amber-700">{error === 'RECS_DISABLED' ? 'Recommendations are temporarily disabled.' : 'We had trouble generating recommendations.'}</p>}
    </section>
  );
}
