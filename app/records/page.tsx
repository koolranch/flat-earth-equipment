'use client';
import React from 'react';

export default function Records(){
  const [rows, setRows] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(()=>{(async()=>{
    try{
      setErr(null);
      const r = await fetch('/api/records', { cache: 'no-store' }); // assume you have this; else swap to your existing fetch
      const j = await r.json();
      setRows(j?.items || []);
    }catch(e:any){ setErr(e.message); }
  })();},[]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 grid gap-6">
      <h1 className="text-2xl font-semibold">Your Records</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="grid gap-3">
        {rows.map((c) => {
          const verifyUrl = c.verify_code ? `${location.origin}/verify/${c.verify_code}` : null;
          return (
            <div key={c.id} className="rounded border p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium truncate">{c.course_slug}</div>
                <div className="text-sm text-slate-600">Issued: {c.issued_at ? new Date(c.issued_at).toLocaleDateString() : '—'}</div>
              </div>
              <div className="flex items-center gap-2">
                {c.pdf_url && <a href={c.pdf_url} target="_blank" rel="noreferrer" className="rounded border px-3 py-2 text-sm bg-white">PDF</a>}
                {verifyUrl && <a href={verifyUrl} className="rounded bg-slate-900 text-white px-3 py-2 text-sm">Verify</a>}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}