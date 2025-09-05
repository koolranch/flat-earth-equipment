'use client';
import { useEffect, useState } from 'react';

type Quest = { id: string; slug: string; title: string; tag: string; locale: string; type: 'hotspots' | 'sequence'; config: any; pass_criteria: any };

export default function QuestEngine({ slug }: { slug: string }) {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [attempt, setAttempt] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try {
      const r = await fetch(`/api/quests/get?slug=${encodeURIComponent(slug)}`);
      const j = await r.json();
      if (!j.ok) return;
      setQuest(j.quest);
      const s = await fetch('/api/quests/attempt/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quest_id: j.quest.id }) });
      const sj = await s.json();
      if (sj.ok) { setAttempt(sj.attempt_id); (window as any)?.analytics?.track?.('quest_start', { slug, quest_id: j.quest.id }); }
    } finally { setLoading(false); }
  })(); }, [slug]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!quest) return <div className="p-4">Not found.</div>;

  return (
    <section className="grid gap-3">
      <h1 className="text-xl font-bold">{quest.title}</h1>
      {quest.type === 'hotspots' ? (
        <Hotspots quest={quest} attempt={attempt} />
      ) : (
        <Sequence quest={quest} attempt={attempt} />
      )}
    </section>
  );
}

function Hotspots({ quest, attempt }: { quest: Quest, attempt: string }) {
  const [hit, setHit] = useState<string[]>([]);
  const cfg = quest.config as { hotspots: { id: string; label: string }[] };
  const total = (cfg.hotspots || []).length;
  
  async function toggle(id: string) {
    if (hit.includes(id)) return;
    const next = [...hit, id]; 
    setHit(next);
    (window as any)?.analytics?.track?.('quest_step', { type: 'hotspots', id });
    await fetch('/api/quests/attempt/step', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attempt_id: attempt, patch: { hit: next }, step_delta: 1 }) });
    if (next.length === total) {
      (window as any)?.analytics?.track?.('quest_complete', { slug: quest.slug, pass: true });
      await fetch('/api/quests/attempt/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attempt_id: attempt, pass: true, score: 100, final_progress: { hit: next } }) });
    }
  }
  
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm text-slate-600">Find all items ({hit.length}/{total})</div>
      <ul className="grid gap-2 mt-2">
        {(cfg.hotspots || []).map(h => (
          <li key={h.id}>
            <button 
              className={`rounded-xl px-3 py-2 border w-full text-left ${hit.includes(h.id) ? 'bg-green-50 border-green-300' : 'hover:bg-slate-50'}`} 
              onClick={() => toggle(h.id)} 
              disabled={hit.includes(h.id)}
            >
              {hit.includes(h.id) ? '✓ ' : ''}{h.label}
            </button>
          </li>
        ))}
      </ul>
      {hit.length === total && (
        <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 font-medium">
          🎉 Quest Complete! All items found.
        </div>
      )}
    </div>
  );
}

function Sequence({ quest, attempt }: { quest: Quest, attempt: string }) {
  const [idx, setIdx] = useState(0);
  const cfg = quest.config as { steps: { id: string; text: string }[] };
  const done = idx >= (cfg.steps || []).length;
  
  async function next() {
    const n = idx + 1; 
    setIdx(n);
    (window as any)?.analytics?.track?.('quest_step', { type: 'sequence', index: n });
    await fetch('/api/quests/attempt/step', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attempt_id: attempt, patch: { idx: n }, step_delta: 1 }) });
    if (n >= (cfg.steps || []).length) {
      (window as any)?.analytics?.track?.('quest_complete', { slug: quest.slug, pass: true });
      await fetch('/api/quests/attempt/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attempt_id: attempt, pass: true, score: 100, final_progress: { idx: n } }) });
    }
  }
  
  if (!cfg.steps || !cfg.steps.length) return <div className="rounded-2xl border bg-white p-4">No steps.</div>;
  
  return (
    <div className="rounded-2xl border bg-white p-4 grid gap-3">
      {!done ? (
        <>
          <div className="text-sm text-slate-600">Step {idx + 1} of {cfg.steps.length}</div>
          <div className="text-lg font-medium">{cfg.steps[idx].text}</div>
          <div className="flex justify-end">
            <button className="rounded-2xl bg-[#F76511] text-white px-4 py-2" onClick={next}>
              Mark step done
            </button>
          </div>
        </>
      ) : (
        <div className="text-green-700 font-medium text-center py-4">
          🎉 Quest Complete! ✓
        </div>
      )}
    </div>
  );
}
