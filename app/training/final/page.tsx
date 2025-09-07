'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/track';

export default function FinalGate() {
  const r = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function start() {
    try {
      setBusy(true); setError(null);
      const res = await fetch('/api/exams/attempts', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ courseSlug: 'forklift_operator', locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en' }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to start');
      track('exam_started', { course: 'forklift_operator' });
      r.push(`/exam/${json.attempt_id}`);
    } catch (e: any) {
      setError(e.message);
    } finally { setBusy(false); }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 grid gap-6">
      <h1 className="text-2xl font-semibold">Final Exam</h1>
      <p className="text-slate-600">Take the exam to earn your certificate.</p>
      <button onClick={start} disabled={busy} className="rounded bg-slate-900 text-white px-4 py-2 disabled:opacity-50">{busy ? 'Starting…' : 'Start Final Exam'}</button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}
