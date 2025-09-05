'use client';
import { useEffect, useMemo, useState } from 'react';

type Card = { id?: string; tag: string; locale: 'en' | 'es'; kind: 'fact' | 'tip' | 'do' | 'dont' | 'definition' | 'step'; title?: string; body?: string; media_url?: string | null; order_index: number; active: boolean };

export default function AdminStudy() {
  const [rows, setRows] = useState<Card[]>([]);
  const [tagF, setTagF] = useState('');
  const [locF, setLocF] = useState<'en' | 'es' | ''>('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Card | null>(null);

  async function load() {
    const u = new URL('/api/admin/study/list', window.location.origin);
    if (tagF) u.searchParams.set('tag', tagF);
    if (locF) u.searchParams.set('locale', locF);
    if (q) u.searchParams.set('q', q);
    const r = await fetch(u);
    const j = await r.json();
    if (j.ok) setRows(j.cards);
  }
  useEffect(() => { load(); }, []);

  async function save(card: Card) {
    const r = await fetch('/api/admin/study/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(card) });
    const j = await r.json(); if (j.ok) { (window as any)?.analytics?.track?.('study_card_saved', { id: j.id, tag: card.tag, locale: card.locale }); await load(); setEditing(null); }
  }

  async function reorder(id: string, dir: -1 | 1) {
    const r = await fetch('/api/admin/study/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, dir }) });
    const j = await r.json(); if (j.ok) await load();
  }

  const tags = useMemo(() => Array.from(new Set(rows.map(r => r.tag))).sort(), [rows]);

  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Admin — Study Cards</h1>
      <section className="rounded-2xl border bg-white p-3 flex flex-wrap gap-2 items-center">
        <input className="border rounded-xl p-2" placeholder="Tag (e.g., stability)" value={tagF} onChange={e => setTagF(e.target.value)} />
        <select className="border rounded-xl p-2" value={locF} onChange={e => setLocF(e.target.value as any)}>
          <option value="">All locales</option>
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
        <input className="border rounded-xl p-2 flex-1 min-w-[200px]" placeholder="Search body/title…" value={q} onChange={e => setQ(e.target.value)} />
        <button className="rounded-2xl bg-[#F76511] text-white px-4 py-2" onClick={load}>Filter</button>
        <button className="rounded-2xl border px-4 py-2 ml-auto" onClick={() => setEditing({ tag: tagF || (tags[0] || 'preop'), locale: 'en', kind: 'fact', title: '', body: '', media_url: '', order_index: (rows[rows.length - 1]?.order_index || 0) + 1, active: true })}>New</button>
      </section>
      <section className="rounded-2xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700"><tr><th className="text-left p-2">Tag</th><th>Loc</th><th className="text-left">Title</th><th>Kind</th><th>#</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={(r as any).id} className="border-t">
                <td className="p-2">{r.tag}</td>
                <td className="text-center">{r.locale}</td>
                <td className="p-2 truncate max-w-[460px]">{r.title || r.body?.slice(0, 80)}</td>
                <td className="text-center">{r.kind}</td>
                <td className="text-center">{r.order_index}</td>
                <td className="text-center">{r.active ? '✓' : ''}</td>
                <td className="p-2 text-right">
                  <button className="rounded-xl border px-2 py-1 mr-2" onClick={() => setEditing(r)}>Edit</button>
                  <button className="rounded-xl border px-2 py-1 mr-1" onClick={() => reorder((r as any).id!, -1)}>↑</button>
                  <button className="rounded-xl border px-2 py-1" onClick={() => reorder((r as any).id!, 1)}>↓</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td className="p-6 text-center text-slate-500" colSpan={7}>No cards</td></tr>}
          </tbody>
        </table>
      </section>

      {editing && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl w-[95vw] max-w-3xl p-4 grid gap-3">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Edit card</h2><button className="rounded-xl border px-3 py-1" onClick={() => setEditing(null)}>Close</button></div>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm"><span>Tag</span><input className="border rounded-xl p-2" value={editing.tag} onChange={e => setEditing({ ...editing, tag: e.target.value.toLowerCase() })} /></label>
              <label className="grid gap-1 text-sm"><span>Locale</span><select className="border rounded-xl p-2" value={editing.locale} onChange={e => setEditing({ ...editing, locale: e.target.value as any })}><option value="en">EN</option><option value="es">ES</option></select></label>
              <label className="grid gap-1 text-sm"><span>Kind</span><select className="border rounded-xl p-2" value={editing.kind} onChange={e => setEditing({ ...editing, kind: e.target.value as any })}><option>fact</option><option>tip</option><option>do</option><option>dont</option><option>definition</option><option>step</option></select></label>
              <label className="grid gap-1 text-sm"><span>Order</span><input type="number" className="border rounded-xl p-2" value={editing.order_index} onChange={e => setEditing({ ...editing, order_index: Number(e.target.value) })} /></label>
              <label className="md:col-span-2 grid gap-1 text-sm"><span>Title (optional)</span><input className="border rounded-xl p-2" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label>
              <label className="md:col-span-2 grid gap-1 text-sm"><span>Body</span><textarea className="border rounded-xl p-2 min-h-[100px]" value={editing.body || ''} onChange={e => setEditing({ ...editing, body: e.target.value })} /></label>
              <label className="md:col-span-2 grid gap-1 text-sm"><span>Media URL (optional)</span><input className="border rounded-xl p-2" value={editing.media_url || ''} onChange={e => setEditing({ ...editing, media_url: e.target.value })} placeholder="https://..." /></label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
            </div>
            <div className="flex justify-end gap-2"><button className="rounded-xl border px-3 py-1" onClick={() => setEditing(null)}>Cancel</button><button className="rounded-xl bg-[#F76511] text-white px-3 py-1" onClick={() => save(editing!)}>Save</button></div>
          </div>
        </div>
      )}
    </main>
  );
}
