'use client';
import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

type Q = { id: string; module_slug: string; locale: 'en' | 'es'; question: string; choices: string[]; correct_index: number; explain?: string; difficulty?: number; tags?: string[]; is_exam_candidate?: boolean; active?: boolean; status?: 'draft' | 'published'; updated_at?: string; version?: number };

export default function AdminQuiz() {
  const [items, setItems] = useState<Q[]>([]);
  const [loading, setLoading] = useState(false);
  const [moduleF, setModuleF] = useState('');
  const [localeF, setLocaleF] = useState<'en' | 'es' | ''>('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Q | null>(null);
  const [audit, setAudit] = useState<any[]>([]);

  async function load() {
    setLoading(true);
    try {
      const u = new URL('/api/admin/quiz/list', window.location.origin);
      if (moduleF) u.searchParams.set('module', moduleF);
      if (localeF) u.searchParams.set('locale', localeF);
      if (q) u.searchParams.set('q', q);
      const r = await fetch(u);
      const j = await r.json();
      if (j.ok) setItems(j.items);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function openEdit(it: Q) {
    setEditing({ ...it });
    const r = await fetch(`/api/admin/quiz/audit/${it.id}`);
    const j = await r.json();
    setAudit(j.revisions || []);
  }

  async function save(it: Q) {
    const r = await fetch('/api/admin/quiz/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(it) });
    const j = await r.json();
    if (j.ok) { (window as any)?.analytics?.track?.('quiz_item_edited', { id: it.id, module: it.module_slug, locale: it.locale }); await load(); }
  }
  async function publish(it: Q) {
    const r = await fetch('/api/admin/quiz/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: it.id }) });
    const j = await r.json();
    if (j.ok) { (window as any)?.analytics?.track?.('quiz_item_published', { id: it.id, module: it.module_slug, locale: it.locale }); await load(); }
  }
  async function revert(question_id: string, revision_id: string) {
    const r = await fetch('/api/admin/quiz/revert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question_id, revision_id }) });
    const j = await r.json();
    if (j.ok) { (window as any)?.analytics?.track?.('quiz_item_reverted', { id: question_id, revision_id }); await load(); }
  }

  const modules = useMemo(() => Array.from(new Set(items.map(i => i.module_slug))).sort(), [items]);

  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Admin — Quiz Editor</h1>

      <section className="rounded-2xl border bg-white p-3 flex flex-wrap gap-2 items-center">
        <select className="border rounded-xl p-2" value={moduleF} onChange={e => setModuleF(e.target.value)}>
          <option value="">All modules</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="border rounded-xl p-2" value={localeF} onChange={e => setLocaleF(e.target.value as any)}>
          <option value="">All locales</option>
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
        <input className="border rounded-xl p-2 flex-1 min-w-[200px]" placeholder="Search question…" value={q} onChange={e => setQ(e.target.value)} />
        <button className="rounded-2xl bg-[#F76511] text-white px-4 py-2" onClick={load} disabled={loading}>Filter</button>
      </section>

      <section className="rounded-2xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr><th className="text-left p-2">Module</th><th>Locale</th><th className="text-left">Question</th><th>Status</th><th>Ver</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} className="border-t">
                <td className="p-2">{it.module_slug}</td>
                <td className="text-center">{it.locale}</td>
                <td className="p-2 truncate max-w-[520px]" title={it.question}>{it.question}</td>
                <td className={clsx('text-center', it.status === 'published' ? 'text-green-700' : 'text-amber-700')}>{it.status}</td>
                <td className="text-center">{it.version || 1}</td>
                <td className="p-2 text-right">
                  <button className="rounded-xl border px-3 py-1 mr-2" onClick={() => openEdit(it)}>Edit</button>
                  {it.status !== 'published' && <button className="rounded-xl bg-[#F76511] text-white px-3 py-1" onClick={() => publish(it)}>Publish</button>}
                </td>
              </tr>
            ))}
            {!items.length && <tr><td className="p-6 text-center text-slate-500" colSpan={6}>No items</td></tr>}
          </tbody>
        </table>
      </section>

      {/* Drawer */}
      {editing && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-2xl w-[95vw] max-w-4xl p-4 grid gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit question</h2>
              <button aria-label="Close" className="rounded-xl border px-3 py-1" onClick={() => setEditing(null)}>Close</button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm"><span>Module</span><input className="border rounded-xl p-2" value={editing.module_slug} onChange={e => setEditing({ ...editing, module_slug: e.target.value })} /></label>
              <label className="grid gap-1 text-sm"><span>Locale</span>
                <select className="border rounded-xl p-2" value={editing.locale} onChange={e => setEditing({ ...editing, locale: e.target.value as any })}>
                  <option value="en">EN</option>
                  <option value="es">ES</option>
                </select>
              </label>
              <label className="md:col-span-2 grid gap-1 text-sm"><span>Question</span><textarea className="border rounded-xl p-2 min-h-[80px]" value={editing.question} onChange={e => setEditing({ ...editing, question: e.target.value })} /></label>
              <div className="md:col-span-2 grid gap-2">
                <div className="font-medium text-sm">Choices</div>
                {editing.choices.map((c, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input className="border rounded-xl p-2 flex-1" value={c} onChange={e => {
                      const arr = [...editing.choices]; arr[idx] = e.target.value; setEditing({ ...editing, choices: arr });
                    }} />
                    <label className="flex items-center gap-2 text-xs"><input type="radio" name="correct" checked={editing.correct_index === idx} onChange={() => setEditing({ ...editing, correct_index: idx })} /> Correct</label>
                    <button className="rounded-xl border px-2 py-1 text-xs" onClick={() => {
                      const arr = editing.choices.filter((_, i) => i !== idx);
                      setEditing({ ...editing, choices: arr, correct_index: editing.correct_index === idx ? 0 : editing.correct_index > idx ? editing.correct_index - 1 : editing.correct_index });
                    }}>Remove</button>
                  </div>
                ))}
                <button className="rounded-xl border px-3 py-1 w-fit" onClick={() => setEditing({ ...editing, choices: [...editing.choices, ''] })}>Add choice</button>
              </div>
              <label className="grid gap-1 text-sm"><span>Explanation (optional)</span><textarea className="border rounded-xl p-2 min-h-[60px]" value={editing.explain || ''} onChange={e => setEditing({ ...editing, explain: e.target.value })} /></label>
              <label className="grid gap-1 text-sm"><span>Difficulty (1–5)</span><input type="number" min={1} max={5} className="border rounded-xl p-2" value={editing.difficulty || 1} onChange={e => setEditing({ ...editing, difficulty: Number(e.target.value) })} /></label>
              <label className="grid gap-1 text-sm"><span>Tags (comma separated)</span><input className="border rounded-xl p-2" value={(editing.tags || []).join(', ')} onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.is_exam_candidate} onChange={e => setEditing({ ...editing, is_exam_candidate: e.target.checked })} /> Exam candidate</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active !== false} onChange={e => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
              <label className="grid gap-1 text-sm"><span>Status</span>
                <select className="border rounded-xl p-2" value={editing.status || 'draft'} onChange={e => setEditing({ ...editing, status: e.target.value as any })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-slate-600">v{editing.version || 1}</div>
              <div className="flex gap-2">
                <button className="rounded-xl border px-3 py-1" onClick={() => save(editing!)}>Save</button>
                {editing.status !== 'published' && <button className="rounded-xl bg-[#F76511] text-white px-3 py-1" onClick={() => publish(editing!)}>Publish</button>}
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="font-semibold text-sm mb-2">Revisions</div>
              <ul className="max-h-48 overflow-auto text-xs">
                {audit.map(r => (
                  <li key={r.id} className="flex items-center justify-between border-b py-1">
                    <div><b>{r.action}</b> · v{r.version} · {new Date(r.created_at).toLocaleString()}</div>
                    <button className="rounded border px-2 py-1" onClick={() => revert(editing!.id, r.id)}>Revert</button>
                  </li>
                ))}
                {!audit.length && <li className="text-slate-500">No revisions yet.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
