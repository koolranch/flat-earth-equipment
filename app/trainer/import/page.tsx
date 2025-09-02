'use client';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { QUIZ_CSV_HEADER, normalizeRow } from '@/lib/quiz/import-utils';

function parseCsv(text:string){
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data as any[];
}

async function callImport(rows:any[], dryRun:boolean){
  const r = await fetch('/api/admin/quiz/import', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ rows, dryRun }) });
  return { status: r.status, json: await r.json() };
}

export default function ImportPage(){
  const [raw, setRaw] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [preview, setPreview] = useState<{ ok:boolean; error?:string }[]>([]);
  const [res, setRes] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(()=>{
    if (!raw.trim()){ setRows([]); setPreview([]); return; }
    try{
      const r = parseCsv(raw);
      setRows(r);
      setPreview(r.map(x=> normalizeRow(x).ok ? { ok:true } : { ok:false, error: (normalizeRow(x) as any).error }));
    } catch(e:any){ setPreview([{ ok:false, error: e?.message||'parse_error' }]); }
  }, [raw]);

  async function onDryRun(){ setBusy(true); setRes(null); try{ const r = await callImport(rows, true); setRes(r.json); } finally{ setBusy(false);} }
  async function onCommit(){ setBusy(true); setRes(null); try{ const r = await callImport(rows, false); setRes(r.json); } finally{ setBusy(false);} }

  return (
    <main className="container mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Import Quiz Items</h1>
        <a className="text-xs underline" href={`data:text/csv;charset=utf-8,${encodeURIComponent(QUIZ_CSV_HEADER+'\n')}`} download="quiz-template.csv">Download CSV template</a>
      </header>

      <section className="grid gap-3">
        <textarea className="w-full min-h-[200px] border rounded-2xl p-2 font-mono text-xs" placeholder={QUIZ_CSV_HEADER+"\npre-operation-inspection,en,Which item goes on first?,Hard hat,High-visibility vest,,, ,1,Vest on first,,m1,ppe,true,true"} value={raw} onChange={e=> setRaw(e.target.value)} />
        <div className="flex gap-2">
          <button disabled={!rows.length||busy} onClick={onDryRun} className="rounded-2xl border px-3 py-2">Dry run</button>
          <button disabled={!rows.length||busy} onClick={onCommit} className="rounded-2xl bg-[#F76511] text-white px-3 py-2">Commit import</button>
        </div>
      </section>

      {!!rows.length && (
        <section className="rounded-2xl border p-3">
          <div className="text-sm font-semibold mb-2">Preview</div>
          <table className="w-full text-xs">
            <thead><tr><th className="text-left p-1">#</th><th className="text-left p-1">module_slug</th><th className="text-left p-1">locale</th><th className="text-left p-1">question</th><th className="text-left p-1">status</th><th className="text-left p-1">error</th></tr></thead>
            <tbody>
              {rows.map((r,idx)=>{
                const p = preview[idx];
                return (
                  <tr key={idx} className={p.ok? '':'bg-red-50'}>
                    <td className="p-1">{idx+1}</td>
                    <td className="p-1">{r.module_slug}</td>
                    <td className="p-1">{r.locale}</td>
                    <td className="p-1 truncate max-w-[480px]" title={r.question}>{r.question}</td>
                    <td className="p-1">{p.ok? 'OK':'Error'}</td>
                    <td className="p-1">{p.error||''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {res && (
        <section className="rounded-2xl border p-3">
          <div className="text-sm font-semibold mb-2">Server result</div>
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(res, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
