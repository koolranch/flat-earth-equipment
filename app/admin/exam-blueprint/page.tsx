'use client';
import { useEffect, useState } from 'react';

type BP = { locale: 'en' | 'es'; count: number; difficulty_weights: Record<string, number>; tag_targets: Record<string, number> };

export default function ExamBlueprint() {
  const [locale, setLocale] = useState<'en' | 'es'>('en');
  const [bp, setBp] = useState<BP | null>(null);

  async function load() {
    const r = await fetch(`/api/admin/exam-blueprint?locale=${locale}`);
    const j = await r.json(); if (j.ok) setBp(j.bp);
  }
  useEffect(() => { load(); }, [locale]);

  async function save() {
    const r = await fetch('/api/admin/exam-blueprint', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...bp, locale }) });
    const j = await r.json(); if (j.ok) alert('Saved.');
  }

  if (!bp) return <main className="container mx-auto p-4">Loading…</main>;
  return (
    <main className="container mx-auto p-4 grid gap-4">
      <h1 className="text-xl font-bold">Admin — Exam Blueprint</h1>
      <div className="flex gap-2 items-center">
        <label>Locale</label>
        <select className="border rounded-xl p-2" value={locale} onChange={e => setLocale(e.target.value as any)}><option value="en">EN</option><option value="es">ES</option></select>
      </div>
      <label className="grid gap-1 text-sm max-w-sm"><span>Question count</span><input className="border rounded-xl p-2" type="number" value={bp.count} onChange={e => setBp({ ...bp!, count: Number(e.target.value) })} /></label>
      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-3"><h2 className="font-semibold">Difficulty weights</h2>
          {['1', '2', '3', '4', '5'].map(k => (
            <label key={k} className="flex items-center justify-between border rounded-xl p-2 my-1"><span>d{k}</span><input className="border rounded-md p-1 w-28" type="number" step="0.01" value={bp.difficulty_weights[k] || 0} onChange={e => setBp({ ...bp!, difficulty_weights: { ...bp!.difficulty_weights, [k]: Number(e.target.value) } })} /></label>
          ))}
        </div>
        <div className="rounded-2xl border p-3"><h2 className="font-semibold">Tag targets (fractions)</h2>
          {['preop', 'inspection', 'stability', 'hazards', 'shutdown'].map(k => (
            <label key={k} className="flex items-center justify-between border rounded-xl p-2 my-1"><span>{k}</span><input className="border rounded-md p-1 w-28" type="number" step="0.01" value={bp.tag_targets[k] || 0} onChange={e => setBp({ ...bp!, tag_targets: { ...bp!.tag_targets, [k]: Number(e.target.value) } })} /></label>
          ))}
        </div>
      </section>
      <div className="flex gap-2"><button className="rounded-2xl bg-[#F76511] text-white px-4 py-2" onClick={save}>Save</button><button className="rounded-2xl border px-4 py-2" onClick={load}>Reload</button></div>
    </main>
  );
}
