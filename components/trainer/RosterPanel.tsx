'use client';
import { useEffect, useMemo, useState } from 'react';

export default function RosterPanel() {
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState<string>('');
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'passed' | 'notpassed'>('all');

  useEffect(() => { 
    (async () => {
      const r = await fetch('/api/courses');
      if (r.ok) { 
        const j = await r.json(); 
        setCourses(j?.data || []); 
        if (j?.data?.[0]) setCourseId(j.data[0].id); 
      }
    })(); 
  }, []);

  useEffect(() => { 
    (async () => {
      if (!courseId) return;
      const r = await fetch(`/api/trainer/roster?course_id=${courseId}`);
      const j = await r.json();
      setRows(j?.data || []);
    })(); 
  }, [courseId]);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    return rows.filter((r: any) => {
      if (filter === 'passed' && !r.passed) return false;
      if (filter === 'notpassed' && r.passed) return false;
      if (search) {
        const hay = `${r.email || ''} ${r.name || ''}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [rows, q, filter]);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Roster</h2>
      <div className="grid sm:grid-cols-4 gap-2">
        <label className="text-sm">Course
          <select 
            value={courseId} 
            onChange={e => setCourseId(e.target.value)} 
            className="block w-full rounded-xl border px-3 py-2 mt-1"
          >
            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">Search
          <input 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            className="block w-full rounded-xl border px-3 py-2 mt-1" 
            placeholder="email or name" 
          />
        </label>
        <label className="text-sm">Filter
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value as any)} 
            className="block w-full rounded-xl border px-3 py-2 mt-1"
          >
            <option value="all">All</option>
            <option value="passed">Passed</option>
            <option value="notpassed">Not Passed</option>
          </select>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <a 
          className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50" 
          href={`/api/trainer/export?course_id=${courseId}`} 
          target="_blank"
        >
          Export CSV
        </a>
        <span className="text-xs text-slate-500">Rows: {filtered.length}</span>
      </div>

      <div className="overflow-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Progress</th>
              <th className="text-left p-2">Passed</th>
              <th className="text-left p-2">Certificate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r: any) => (
              <tr key={r.enrollment_id} className="border-t hover:bg-slate-50">
                <td className="p-2 font-mono">{r.email || '—'}</td>
                <td className="p-2">{r.name || '—'}</td>
                <td className="p-2">{r.progress_pct ?? 0}%</td>
                <td className="p-2">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                    r.passed ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {r.passed ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="p-2">
                  {r.verification_code ? (
                    <div className="flex items-center gap-2">
                      <a 
                        className="underline text-blue-600 hover:text-blue-800" 
                        href={`/verify/${r.verification_code}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Verify
                      </a>
                      {r.pdf_url && (
                        <a 
                          className="underline text-orange-600 hover:text-orange-800" 
                          href={r.pdf_url} 
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          PDF
                        </a>
                      )}
                    </div>
                  ) : '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  {rows.length === 0 ? 'No enrollments found for this course.' : 'No results match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
