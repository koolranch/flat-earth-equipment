'use client';
import { useEffect, useState } from 'react';

export default function AssignSeatsPanel() {
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState<string>('');
  const [raw, setRaw] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

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

  function parseRaw(value: string) {
    const parts = value.split(/\n|,|;|\s+/).map(s => s.trim().toLowerCase()).filter(Boolean);
    const uniq = Array.from(new Set(parts.filter(x => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x))));
    setEmails(uniq);
  }

  async function onCSV(file: File) {
    const text = await file.text();
    // simple CSV parse: find emails by regex; keeps DX minimal
    const found = Array.from(new Set((text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map(x => x.toLowerCase())));
    setRaw(found.join('\n'));
    setEmails(found);
  }

  async function submit() {
    if (!courseId || emails.length === 0) return;
    setLoading(true);
    const r = await fetch('/api/trainer/assign-seats', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ course_id: courseId, emails }) 
    });
    const j = await r.json();
    setResult(j);
    setLoading(false);
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Assign Seats</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="text-sm">Course
          <select 
            value={courseId} 
            onChange={e => setCourseId(e.target.value)} 
            className="block w-full rounded-xl border px-3 py-2 mt-1"
          >
            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">Paste emails (one per line)
          <textarea 
            value={raw} 
            onChange={e => { setRaw(e.target.value); parseRaw(e.target.value); }} 
            rows={6} 
            className="block w-full rounded-xl border px-3 py-2 mt-1 font-mono" 
            placeholder="worker1@example.com&#10;worker2@example.com"
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input 
          type="file" 
          accept=".csv,text/csv" 
          onChange={e => e.target.files && onCSV(e.target.files[0])} 
        />
        <span className="text-xs text-slate-500">Or upload a CSV with an email column.</span>
      </div>
      <div className="text-sm">Parsed emails: <span className="font-medium">{emails.length}</span></div>
      <button 
        onClick={submit} 
        disabled={loading || !courseId || emails.length === 0} 
        className="rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Assigning…' : 'Assign seats'}
      </button>

      {result && (
        <div className="mt-3 rounded-xl border p-3 text-sm">
          <div className="font-semibold mb-1">Results</div>
          <ul className="space-y-1">
            {result.results?.map((r: any, i: number) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span className="font-mono">{r.email}</span>
                <span className="text-slate-600">{r.status}{r.reason ? ` — ${r.reason}` : ''}</span>
                {r.enrollment_id && <span className="text-xs text-slate-500">{r.enrollment_id}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
