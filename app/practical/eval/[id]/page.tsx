'use client';
import React from 'react';
import SignaturePad from '@/components/SignaturePad';
import { useParams, useRouter } from 'next/navigation';

type Item = { id: string; label: string; required?: boolean };

export default function PracticalRunner(){
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<Item[]>([]);
  const [state, setState] = React.useState<Record<string, boolean>>({});
  const [notes, setNotes] = React.useState('');
  const [sigTrainee, setSigTrainee] = React.useState<string | null>(null);
  const [sigTrainer, setSigTrainer] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(()=>{(async()=>{
    try{
      const r = await fetch(`/api/practical/${id}`); const j = await r.json();
      if(!r.ok) throw new Error(j?.error || 'Load failed');
      setItems(j.checklist); setState(j.checklist.reduce((m: any, it: Item)=>({ ...m, [it.id]: false }), {})); setNotes(j.attempt?.notes || '');
    }catch(e:any){ setError(e.message); } finally { setLoading(false); }
  })();},[id]);

  async function save(){
    await fetch(`/api/practical/${id}/save`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ checklist_state: state, notes }) });
  }
  async function sign(role: 'trainee'|'trainer', dataUrl: string){
    await fetch(`/api/practical/${id}/sign`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ role, data_url: dataUrl }) });
  }
  async function complete(passed: boolean){
    try{ setSubmitting(true);
      await save();
      await fetch(`/api/practical/${id}/complete`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ passed }) });
      router.push('/records');
    } finally { setSubmitting(false); }
  }

  if (loading) return <main className="mx-auto max-w-3xl px-4 py-10">Loading…</main>;
  if (error) return <main className="mx-auto max-w-3xl px-4 py-10 text-red-600">{error}</main>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 grid gap-8">
      <h1 className="text-2xl font-semibold">Practical Evaluation</h1>
      <section className="grid gap-2">
        {items.map(it => (
          <label key={it.id} className="flex items-center gap-3 rounded border p-3">
            <input type="checkbox" checked={!!state[it.id]} onChange={e=>setState(s=>({ ...s, [it.id]: e.target.checked }))}/>
            <span className="font-medium">{it.label}{it.required ? ' *' : ''}</span>
          </label>
        ))}
      </section>
      <section className="grid gap-2">
        <label className="text-sm text-slate-600">Notes</label>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4} className="rounded border p-2"/>
        <button onClick={save} className="justify-self-start rounded border px-3 py-1">Save</button>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-medium mb-2">Trainee Signature</h2>
          <SignaturePad onChange={(d)=>{ setSigTrainee(d); }} />
          <button disabled={!sigTrainee} onClick={()=>sign('trainee', sigTrainee!)} className="mt-2 rounded bg-slate-900 text-white px-3 py-1 disabled:opacity-50">Save Trainee Signature</button>
        </div>
        <div>
          <h2 className="font-medium mb-2">Trainer Signature</h2>
          <SignaturePad onChange={(d)=>{ setSigTrainer(d); }} />
          <button disabled={!sigTrainer} onClick={()=>sign('trainer', sigTrainer!)} className="mt-2 rounded bg-slate-900 text-white px-3 py-1 disabled:opacity-50">Save Trainer Signature</button>
        </div>
      </section>
      <section className="flex items-center gap-3">
        <button disabled={submitting} onClick={()=>complete(true)} className="rounded bg-green-700 text-white px-4 py-2 disabled:opacity-50">Mark Passed</button>
        <button disabled={submitting} onClick={()=>complete(false)} className="rounded bg-red-700 text-white px-4 py-2 disabled:opacity-50">Mark Failed</button>
      </section>
    </main>
  );
}
