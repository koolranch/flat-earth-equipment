'use client';
import { useState } from 'react';

const TYPES = [
  { key: 'serial',  label: 'Serial note',  help: 'Help decode year/series changes or serial patterns.' },
  { key: 'fault',   label: 'Fault tip',    help: 'Add steps, symptoms, or code context that helped you.' },
  { key: 'plate',   label: 'Plate location', help: 'Where is the data/serial plate on this model?' },
  { key: 'guide',   label: 'Guide note',  help: 'Any other maintenance/ID tip that helps others.' }
];

export default function SubmissionFormV2({ brand }: { brand: { slug: string; name?: string } }) {
  const [type, setType] = useState('serial');
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null); setOk(false); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch('/api/svc/submit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
        brand: brand.slug,
        type,
        model: payload.model || '',
        code: payload.code || '',
        title: payload.title || '',
        content: payload.details || '',
        photos: (payload.photos as string) || '',
        email: payload.email || ''
      })});
      if (!res.ok) throw new Error('Submit failed');
      setOk(true);
      (window as any)?.va?.track?.('svc_submission', { brand: brand.slug, type });
      (e.target as HTMLFormElement).reset();
    } catch (err:any) {
      setErr(err.message || 'Error');
      (window as any)?.va?.track?.('svc_submission_error', { brand: brand.slug, type });
    } finally { setLoading(false); }
  }

  return (
    <section id='tips' className='bg-white border border-slate-200 rounded-2xl p-6 shadow-sm'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-slate-900 mb-2'>Help improve this page</h3>
        <p className='text-sm text-slate-600 leading-relaxed'>Share a quick tip (2–3 minutes). Your note helps other techs. We review before publishing.</p>
      </div>
      <form onSubmit={onSubmit} className='space-y-5'>
        {/* Type pills */}
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-2'>What type of tip are you sharing?</label>
          <div className='flex flex-wrap gap-2 mb-2'>
            {TYPES.map(t => (
              <button 
                type='button' 
                key={t.key} 
                onClick={() => setType(t.key)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  type === t.key 
                    ? 'bg-orange-50 border-orange-200 text-orange-800' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className='text-xs text-slate-500 leading-relaxed'>{TYPES.find(t=>t.key===type)?.help}</p>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>Model</label>
            <input name='model' placeholder='e.g., 8FGCU25, SJ3219' className='w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500' />
          </div>
          {/* Fault code field visible when type=fault */}
          {type === 'fault' && (
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>Fault Code</label>
              <input name='code' placeholder='e.g., E-43, A-36' className='w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500' />
            </div>
          )}
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              Title <span className='text-slate-500 font-normal'>(optional)</span>
            </label>
            <input name='title' placeholder='Short summary' className='w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500' />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              Photo URLs <span className='text-slate-500 font-normal'>(optional)</span>
            </label>
            <input name='photos' placeholder='http://, http://...' className='w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500' />
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-slate-700 mb-2'>Details</label>
          <textarea 
            name='details' 
            required 
            rows={4} 
            placeholder={type==='plate' ? 'Where exactly is the plate? Panel/cover to remove? Orientation?' : type==='fault' ? 'Symptoms, steps to retrieve codes, what fixed it, cautions.' : 'What did you learn? Serial pattern, year break, guide tip.'} 
            className='w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
          ></textarea>
        </div>

        <div className='grid gap-4 md:grid-cols-2 md:items-start'>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              Contact Email <span className='text-slate-500 font-normal'>(optional; for follow-up)</span>
            </label>
            <input name='email' type='email' placeholder='you@company.com' className='w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500' />
          </div>
          <div className='text-xs text-slate-500 md:pt-8 leading-relaxed'>
            No sensitive/customer data. Submissions are reviewed and may be edited for clarity.
          </div>
        </div>

        {err ? <div className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3'>{err}</div> : null}
        {ok ? <div className='text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3'>Thanks! Your tip was received and is pending review.</div> : null}

        <div className='pt-2'>
          <button 
            disabled={loading} 
            className='px-6 py-3 rounded-2xl bg-orange-600 text-white font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {loading ? 'Submitting…' : 'Submit tip'}
          </button>
        </div>
      </form>
    </section>
  );
}
