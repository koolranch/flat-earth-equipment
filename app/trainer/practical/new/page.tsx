'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function StartPractical() {
  const r = useRouter();
  const [trainee, setTrainee] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function start() {
    try {
      setBusy(true); setErr(null);
      // supports either a UUID or email (server expects UUID; keep email helper API for later if needed)
      const trainee_user_id = trainee.trim();
      const res = await fetch('/api/practical/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trainee_user_id }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to start');
      r.push(`/practical/eval/${json.id}`);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 grid gap-4">
      <h1 className="text-2xl font-semibold">Start Practical Evaluation</h1>
      <p className="text-slate-600">Enter the trainee user ID (UUID). We can add email lookup later.</p>
      <input value={trainee} onChange={e=>setTrainee(e.target.value)} placeholder="trainee user id" className="rounded border px-3 py-2"/>
      <button onClick={start} disabled={busy || !trainee} className="rounded bg-slate-900 text-white px-4 py-2 disabled:opacity-50">{busy ? 'Starting…' : 'Start Evaluation'}</button>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </main>
  );
}
