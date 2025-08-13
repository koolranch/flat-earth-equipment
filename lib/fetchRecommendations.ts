import type { RecommendInput, RecommendResponse } from '@/types/recommendations';
export async function fetchRecommendations(payload: RecommendInput, signal?: AbortSignal): Promise<RecommendResponse> {
  const enabled = process.env.NEXT_PUBLIC_RECS_ENABLED ?? process.env.RECS_ENABLED ?? '1';
  if (enabled === '0') return { ok:false, error:'RECS_DISABLED' } as any;
  const res = await fetch('/api/recommend-chargers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal });
  if (!res.ok) return { ok:false, error: await res.text() } as any;
  return res.json();
}