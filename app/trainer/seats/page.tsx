'use client';
import { useEffect, useState } from 'react';

type Row = { order_id: string; course_slug: string; seats: number; claimed: number; remaining: number; amount_cents: number; created_at: string };

export default function TrainerSeats() {
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);

  async function load(p = 1) {
    setLoading(true);
    const u = new URL('/api/trainer/orders', window.location.origin);
    u.searchParams.set('page', String(p));
    u.searchParams.set('pageSize', String(pageSize));
    const r = await fetch(u);
    if (r.status === 401 || r.status === 403) { setRows([]); setTotal(0); setLoading(false); return; }
    const j = await r.json();
    if (j.ok) { setRows(j.items || []); setPage(j.page || 1); setTotal(j.total || 0); setPageSize(j.pageSize || 50); }
    setLoading(false);
  }
  useEffect(() => { load(1); }, []);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="container mx-auto p-4 grid gap-4">
      <header className="flex items-center">
        <h1 className="text-xl font-bold">Seats</h1>
        <div className="ml-auto flex gap-2">
          <a href="/trainer/dashboard" className="rounded-2xl border px-3 py-2">Roster</a>
          <a href="/trainer/invites" className="rounded-2xl border px-3 py-2">Manage invites</a>
        </div>
      </header>

      <section className="rounded-2xl border bg-white overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="text-left p-2">Order</th>
              <th className="text-left p-2">Course</th>
              <th className="text-right p-2">Seats</th>
              <th className="text-right p-2">Claimed</th>
              <th className="text-right p-2">Remaining</th>
              <th className="text-right p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.order_id} className="border-t">
                <td className="p-2">{r.order_id.slice(0, 8)}…</td>
                <td className="p-2">{r.course_slug}</td>
                <td className="p-2 text-right">{r.seats}</td>
                <td className="p-2 text-right">{r.claimed}</td>
                <td className="p-2 text-right font-semibold">{r.remaining}</td>
                <td className="p-2 text-right whitespace-nowrap">
                  <a className="rounded-xl border px-2 py-1 mr-2" href={`/trainer/invites?order=${r.order_id}`}>Invite</a>
                  <a className="rounded-xl border px-2 py-1" href={`/api/trainer/export.csv?order_id=${r.order_id}`}>Export</a>
                </td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <nav className="flex items-center gap-2 justify-end">
        <button className="rounded-xl border px-3 py-1 disabled:opacity-50" disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1); }}>Prev</button>
        <span className="text-sm">Page {page} / {pages}</span>
        <button className="rounded-xl border px-3 py-1 disabled:opacity-50" disabled={page >= pages} onClick={() => { setPage(p => p + 1); load(page + 1); }}>Next</button>
      </nav>
    </main>
  );
}
