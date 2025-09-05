'use client';
import { useEffect, useMemo, useState } from 'react';

type Card = { id: string; tag: string; locale: string; kind: 'fact' | 'tip' | 'do' | 'dont' | 'definition' | 'step'; title?: string; body?: string; media_url?: string | null; order_index: number; module_slug?: string | null };

export default function StudyByTag({ params }: { params: { tag: string } }) {
  const tag = (params.tag || '').toLowerCase();
  const [cards, setCards] = useState<Card[]>([]);
  const [questSlug, setQuestSlug] = useState<string>('');
  const [i, setI] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const locale = (document.documentElement.lang === 'es' ? 'es' : 'en');
    (async () => {
      try {
        const r = await fetch(`/api/study/by-tag?tag=${encodeURIComponent(tag)}&locale=${locale}`);
        const j = await r.json();
        if (j.ok) { setCards(j.cards || []); (window as any)?.analytics?.track?.('study_open', { tag, locale: j.locale, count: j.count }); }
        
        const q = await fetch(`/api/quests/list?tag=${encodeURIComponent(tag)}&locale=${locale}`);
        const jq = await q.json();
        if (jq.ok && (jq.items || []).length) { setQuestSlug(jq.items[0].slug); }
      } finally { setLoading(false); }
    })();
  }, [tag]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, cards.length]);

  const total = cards.length;
  const current = useMemo(() => cards[i] || null, [cards, i]);
  function next() { if (i < total - 1) { setI(i + 1); (window as any)?.analytics?.track?.('study_card_next', { tag, index: i + 1, total }); } else { (window as any)?.analytics?.track?.('study_complete', { tag, total }); } }
  function prev() { if (i > 0) { setI(i - 1); (window as any)?.analytics?.track?.('study_card_prev', { tag, index: i - 1, total }); } }

  if (loading) return <main className="container mx-auto p-4">Loading…</main>;
  if (!total) return <main className="container mx-auto p-4"><h1 className="text-xl font-bold">Study</h1><p className="text-slate-600">No study cards for this topic yet.</p></main>;

  return (
    <main className="container mx-auto p-4 grid gap-4">
      <header className="flex items-center gap-3">
        <h1 className="text-xl font-bold capitalize">Study — {tag}</h1>
        <div className="ml-auto text-sm text-slate-600" aria-live="polite">{i + 1} / {total}</div>
      </header>

      {questSlug && (
        <a href={`/training/quests/${questSlug}`} className="rounded-2xl border px-4 py-2 w-fit">Practice drill →</a>
      )}

      <article className="rounded-2xl border bg-white p-4 grid gap-3" role="region" aria-label="Study card">
        {current && (
          <div className="grid gap-2">
            {current.title && <h2 className="text-lg font-semibold">{current.title}</h2>}
            {current.media_url && (
              <div className="rounded-xl overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.media_url} alt="Study visual" className="w-full h-auto" />
              </div>
            )}
            {current.body && <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{current.body}</p>}
            {labelFor(current.kind) && <span className="inline-block rounded-xl px-2 py-1 text-xs border bg-slate-50 w-fit">{labelFor(current.kind)}</span>}
          </div>
        )}
        <nav className="flex gap-2 pt-2" aria-label="Study navigation">
          <button onClick={prev} disabled={i === 0} className="rounded-2xl border px-4 py-2 disabled:opacity-50" aria-label="Previous">←</button>
          <button onClick={next} className="ml-auto rounded-2xl bg-[#F76511] text-white px-4 py-2" aria-label="Next">Next →</button>
        </nav>
      </article>

      <a href="/training" className="rounded-2xl border px-4 py-2 w-fit">Back to Hub</a>
    </main>
  );
}

function labelFor(kind: Card['kind']) {
  switch (kind) {
    case 'do': return 'Do';
    case 'dont': return "Don't";
    case 'tip': return 'Tip';
    case 'definition': return 'Definition';
    case 'step': return 'Step';
    default: return 'Fact';
  }
}
