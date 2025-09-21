// Client-side helper to mark a training gate done
export type Gate = 'osha' | 'practice' | 'cards' | 'quiz';

export async function markGateDone(moduleSlug: string, gate: Gate) {
  try {
    const r = await fetch('/api/training/progress', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ moduleSlug, stepKey: gate })
    });
    const j = await r.json();
    if (!r.ok || !j?.ok) throw new Error(j?.error || 'progress-failed');
    return j; // { ok:true, progress_pct, resume_state }
  } catch (e) {
    console.error('[markGateDone] failed', e);
    throw e;
  }
}
