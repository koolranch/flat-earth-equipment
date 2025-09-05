'use client';
import { useEffect, useMemo, useState } from 'react';

type Row = { enrollment_id: string; learner_id: string; learner_name: string; learner_email: string; course_slug: string; progress_pct: number; status: 'not_started' | 'in_progress' | 'passed'; passed: boolean; cert_pdf_url: string | null; cert_issued_at: string | null; updated_at?: string; created_at?: string };

export default function TrainerDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'not_started' | 'in_progress' | 'passed'>('all');
  const [course, setCourse] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  async function load(p = page) {
    setLoading(true);
    const u = new URL('/api/trainer/roster', window.location.origin);
    if (q) u.searchParams.set('q', q);
    if (status) u.searchParams.set('status', status);
    if (course) u.searchParams.set('course_slug', course);
    if (from) u.searchParams.set('from', from);
    if (to) u.searchParams.set('to', to);
    u.searchParams.set('page', String(p));
    u.searchParams.set('pageSize', String(pageSize));
    const r = await fetch(u.toString());
    if (r.status === 401 || r.status === 403) { setRows([]); setTotal(0); setLoading(false); return; }
    const j = await r.json();
    if (j.ok) { setRows(j.items || []); setTotal(j.total || 0); setPage(j.page || 1); setPageSize(j.pageSize || 50); }
    setLoading(false);
  }

  useEffect(() => { load(1); }, []);

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const summary = useMemo(() => ({
    total,
    passed: rows.filter(r => r.status === 'passed').length,
    in_progress: rows.filter(r => r.status === 'in_progress').length,
    not_started: rows.filter(r => r.status === 'not_started').length,
  }), [rows, total]);

  return (
    <main className="container mx-auto p-4 grid gap-4">
      <h1 className="text-xl font-bold">Trainer Dashboard</h1>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total" value={summary.total} />
        <Stat label="Passed" value={summary.passed} />
        <Stat label="In progress" value={summary.in_progress} />
        <Stat label="Not started" value={summary.not_started} />
      </section>

      <section className="rounded-2xl border bg-white p-3 grid gap-2">
        <div className="grid md:grid-cols-5 gap-2">
          <input className="border rounded-xl p-2" placeholder="Search name/email" value={q} onChange={e => setQ(e.target.value)} />
          <select className="border rounded-xl p-2" value={status} onChange={e => setStatus(e.target.value as any)}>
            <option value="all">All</option>
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="passed">Passed</option>
          </select>
          <input className="border rounded-xl p-2" placeholder="Course slug (optional)" value={course} onChange={e => setCourse(e.target.value)} />
          <input className="border rounded-xl p-2" type="date" value={from} onChange={e => setFrom(e.target.value)} />
          <input className="border rounded-xl p-2" type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div className="flex gap-2 justify-end">
          <button className="rounded-2xl border px-4 py-2" onClick={() => load(1)}>Apply</button>
          <a className="rounded-2xl bg-[#F76511] text-white px-4 py-2" href={exportHref({ q, status, course, from, to })}>Export CSV</a>
        </div>
      </section>

      <section className="rounded-2xl border overflow-auto bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="text-left p-2">Learner</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Course</th>
              <th className="text-right p-2">Progress</th>
              <th className="text-center p-2">Status</th>
              <th className="text-center p-2">Certificate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.enrollment_id} className="border-t">
                <td className="p-2">{r.learner_name}</td>
                <td className="p-2">{r.learner_email}</td>
                <td className="p-2">{r.course_slug}</td>
                <td className="p-2 text-right">{Math.round(r.progress_pct || 0)}%</td>
                <td className="p-2 text-center"><StatusBadge status={r.status} /></td>
                <td className="p-2 text-center">{r.cert_pdf_url ? <a className="underline" href={r.cert_pdf_url} target="_blank" rel="noreferrer">PDF</a> : '—'}</td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">No results</td></tr>
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

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border bg-white p-3 grid"><span className="text-slate-600 text-sm">{label}</span><span className="text-2xl font-bold">{value}</span></div>;
}

function StatusBadge({ status }: { status: 'not_started' | 'in_progress' | 'passed' }) {
  const styles = status === 'passed' ? 'bg-green-50 border-green-300 text-green-800' : status === 'in_progress' ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-300 text-slate-700';
  return <span className={`inline-block rounded-xl border px-2 py-1 text-xs ${styles}`}>{status.replace('_', ' ')}</span>;
}

function exportHref({ q, status, course, from, to }: { q?: string; status?: string; course?: string; from?: string; to?: string }) {
  const u = new URL('/api/trainer/export.csv', window.location.origin);
  if (q) u.searchParams.set('q', q);
  if (status) u.searchParams.set('status', status);
  if (course) u.searchParams.set('course_slug', course);
  if (from) u.searchParams.set('from', from);
  if (to) u.searchParams.set('to', to);
  return u.toString();
}
