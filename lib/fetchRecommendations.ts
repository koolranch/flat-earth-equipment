import type { RecommendInput, RecommendResponse } from '@/types/recommendations';

export async function fetchRecommendations(payload: RecommendInput, signal?: AbortSignal): Promise<RecommendResponse> {
  try {
    const enabled = process.env.NEXT_PUBLIC_RECS_ENABLED ?? process.env.RECS_ENABLED ?? '1';
    if (enabled === '0') return { ok: false, error: 'RECS_DISABLED' };
    
    const res = await fetch('/api/recommend-chargers', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload),
      signal 
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      return { ok: false, error: errorText || `HTTP ${res.status}` };
    }
    
    const data = await res.json();
    return data;
  } catch (error: any) {
    // Handle aborted requests gracefully
    if (error?.name === 'AbortError') {
      return { ok: false, error: 'Request cancelled' };
    }
    return { ok: false, error: error?.message || 'Network error' };
  }
}