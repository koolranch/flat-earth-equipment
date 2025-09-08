'use client';
import React from 'react';

export default function Records(){
  const [state, setState] = React.useState<{ eligible: boolean; reasons: {key:string;message:string}[] } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(()=>{(async()=>{
    try{
      setErr(null);
      // Fetch current user from session API if you have it; here we only call eligibility if server exposes user context elsewhere
      const me = await fetch('/api/me').then(r=>r.ok?r.json():null).catch(()=>null);
      if(!me?.user?.id) return;
      const r = await fetch(`/api/eligibility?user=${me.user.id}`);
      const j = await r.json();
      setState(j);
    }catch(e:any){ setErr(e.message); }
  })();},[]);

  async function issue(){
    try{ setBusy(true); setErr(null);
      const r = await fetch('/api/certificates/issue', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({}) });
      const j = await r.json();
      if(!r.ok) throw new Error(j?.error || 'issue_failed');
      // Optionally kick PDF job
      await fetch('/api/certificates/pdf', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ certificate_id: j.id }) });
      location.href = '/records';
    }catch(e:any){ setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 grid gap-6">
      <h1 className="text-2xl font-semibold">Your Records</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {state ? (
        <section className={`rounded border p-4 ${state.eligible ? 'border-green-600' : 'border-amber-500'}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Certificate Eligibility</div>
              {state.eligible ? (
                <p className="text-sm text-slate-600">You've met all requirements. You can issue your certificate now.</p>
              ) : (
                <ul className="text-sm text-slate-700 list-disc ml-5">
                  {state.reasons.map(r => <li key={r.key}>{r.message}</li>)}
                </ul>
              )}
            </div>
            <div>
              <button onClick={issue} disabled={!state.eligible || busy} className="rounded bg-slate-900 text-white px-4 py-2 disabled:opacity-50">{busy ? 'Issuing…' : 'Issue Certificate'}</button>
            </div>
          </div>
        </section>
      ) : (
        <p>Loading…</p>
      )}
    </main>
  );
}