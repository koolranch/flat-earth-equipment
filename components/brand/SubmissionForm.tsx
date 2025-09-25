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
    <form onSubmit={submit} className='bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm'>
      <div className='text-sm text-slate-600 leading-relaxed mb-4'>Help improve our {brand.name} data. Submit plate locations, serial/fault tips, or corrections.</div>
      <div className='grid sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Type</label>
          <select name='suggestion_type' className='w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500' required>
            <option value='serial_note'>Serial note</option>
            <option value='fault_code'>Fault code tip</option>
            <option value='retrieval'>How to read codes</option>
            <option value='plate_location'>Plate location</option>
            <option value='guide_feedback'>Guide feedback</option>
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Model</label>
          <input name='model' className='w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500' placeholder='e.g., 8FGCU25' />
        </div>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Serial <span className='text-slate-500 font-normal'>(optional)</span></label>
          <input name='serial' className='w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500' placeholder='Equipment serial number' />
        </div>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Fault Code <span className='text-slate-500 font-normal'>(optional)</span></label>
          <input name='code' className='w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500' placeholder='e.g., E-43' />
        </div>
      </div>
      <div>
        <label className='block text-sm font-medium text-slate-700 mb-1'>Title <span className='text-slate-500 font-normal'>(optional)</span></label>
        <input name='title' className='w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500' placeholder='Short summary' />
      </div>
      <div>
        <label className='block text-sm font-medium text-slate-700 mb-1'>Details</label>
        <textarea name='details' className='w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[120px]' required placeholder='What did you find? Where is the plate? Steps to retrieve codes? Include context.'></textarea>
      </div>
      <div className='grid sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Photo URLs <span className='text-slate-500 font-normal'>(optional)</span></label>
          <input name='photos' className='w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500' placeholder='http://... | http://...' />
        </div>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Contact Email <span className='text-slate-500 font-normal'>(optional)</span></label>
          <input name='contact_email' type='email' className='w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500' placeholder='for follow-up' />
        </div>
      </div>
      
      {ok && <div className='text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3'>{ok}</div>}
      {err && <div className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3'>{err}</div>}
      
      <div className='pt-2'>
        <button disabled={loading} className='px-6 py-3 rounded-2xl bg-orange-600 text-white font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
          {loading?'Submitting…':'Submit tip'}
        </button>
      </div>
    </form>
  );
}
