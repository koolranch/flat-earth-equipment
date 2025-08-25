'use client';
import { useState } from 'react';

export default function SubmissionForm({ brand }: { brand: { slug:string; name:string } }){
  const [loading,setLoading] = useState(false);
  const [ok,setOk] = useState<string|null>(null);
  const [err,setErr] = useState<string|null>(null);
  
  async function submit(e: any){
    e.preventDefault(); setErr(null); setOk(null); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try{
      const res = await fetch('/api/svc/submit',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({
        brand: brand.slug, suggestion_type: payload.suggestion_type, model: payload.model||null, serial: payload.serial||null, code: payload.code||null, title: payload.title||null, details: payload.details, photos: payload.photos? String(payload.photos).split(/[|;]\s*/): null, contact_email: payload.contact_email||null
      })});
      const j = await res.json();
      if(!res.ok){ throw new Error(j.error||'Submit failed'); }
      setOk('Thanks! Our team will review and update the guide if needed.');
      (e.target as HTMLFormElement).reset();
      // analytics
      try {
        (window as any).va?.('svc_submission',{ brand: brand.slug, type: payload.suggestion_type });
      } catch {}
    }catch(e:any){ setErr(e.message); } finally{ setLoading(false); }
  }
  
  return (
    <form onSubmit={submit} className='rounded-2xl border p-4 space-y-3 bg-card'>
      <div className='text-sm text-muted-foreground'>Help improve our {brand.name} data. Submit plate locations, serial/fault tips, or corrections.</div>
      <div className='grid sm:grid-cols-2 gap-3'>
        <label className='text-sm'>Type
          <select name='suggestion_type' className='w-full border rounded p-2' required>
            <option value='serial_note'>Serial note</option>
            <option value='fault_code'>Fault code tip</option>
            <option value='retrieval'>How to read codes</option>
            <option value='plate_location'>Plate location</option>
            <option value='guide_feedback'>Guide feedback</option>
          </select>
        </label>
        <label className='text-sm'>Model
          <input name='model' className='w-full border rounded p-2' placeholder='e.g., 8FGCU25' />
        </label>
        <label className='text-sm'>Serial
          <input name='serial' className='w-full border rounded p-2' placeholder='optional' />
        </label>
        <label className='text-sm'>Fault Code
          <input name='code' className='w-full border rounded p-2' placeholder='e.g., E-43' />
        </label>
      </div>
      <label className='text-sm block'>Title
        <input name='title' className='w-full border rounded p-2' placeholder='Short summary (optional)' />
      </label>
      <label className='text-sm block'>Details
        <textarea name='details' className='w-full border rounded p-2 min-h-[120px]' required placeholder='What did you find? Where is the plate? Steps to retrieve codes? Include context.'></textarea>
      </label>
      <div className='grid sm:grid-cols-2 gap-3'>
        <label className='text-sm'>Photo URLs
          <input name='photos' className='w-full border rounded p-2' placeholder='http://... | http://...' />
        </label>
        <label className='text-sm'>Contact Email
          <input name='contact_email' type='email' className='w-full border rounded p-2' placeholder='optional, for follow-up' />
        </label>
      </div>
      <button disabled={loading} className='px-4 py-2 rounded bg-primary text-primary-foreground'>
        {loading?'Submitting…':'Submit tip'}
      </button>
      {ok && <p className='text-green-600 text-sm'>{ok}</p>}
      {err && <p className='text-red-600 text-sm'>{err}</p>}
    </form>
  );
}
