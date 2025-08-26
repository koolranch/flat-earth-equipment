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
    <section id='tips' className='border rounded-xl p-4 bg-card'>
      <div className='mb-3'>
        <h3 className='text-base font-semibold'>Help improve this page</h3>
        <p className='text-sm text-muted-foreground'>Share a quick tip (2–3 minutes). Your note helps other techs. We review before publishing.</p>
      </div>
      <form onSubmit={onSubmit} className='space-y-3'>
        {/* Type pills */}
        <div className='flex flex-wrap gap-2'>
          {TYPES.map(t => (
            <button type='button' key={t.key} onClick={() => setType(t.key)}
              className={`px-3 py-1 rounded-full border text-sm ${type===t.key ? 'bg-brand/5 border-brand-accent' : 'bg-muted border-border'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <p className='text-xs text-muted-foreground -mt-1'>{TYPES.find(t=>t.key===type)?.help}</p>

        <div className='grid gap-3 md:grid-cols-2'>
          <div>
            <label className='text-sm'>Model</label>
            <input name='model' placeholder='e.g., 8FGCU25, SJ3219' className='w-full border rounded-md px-3 py-2' />
          </div>
          {/* Fault code field visible when type=fault */}
          <div className={type==='fault' ? '' : 'hidden'}>
            <label className='text-sm'>Fault Code</label>
            <input name='code' placeholder='e.g., E-43, A-36' className='w-full border rounded-md px-3 py-2' />
          </div>
        </div>

        <div className='grid gap-3 md:grid-cols-2'>
          <div>
            <label className='text-sm'>Title <span className='text-muted-foreground'>(optional)</span></label>
            <input name='title' placeholder='Short summary' className='w-full border rounded-md px-3 py-2' />
          </div>
          <div>
            <label className='text-sm'>Photo URLs <span className='text-muted-foreground'>(optional)</span></label>
            <input name='photos' placeholder='http://, http://...' className='w-full border rounded-md px-3 py-2' />
          </div>
        </div>

        <div>
          <label className='text-sm'>Details</label>
          <textarea name='details' required rows={4} placeholder={type==='plate' ? 'Where exactly is the plate? Panel/cover to remove? Orientation?' : type==='fault' ? 'Symptoms, steps to retrieve codes, what fixed it, cautions.' : 'What did you learn? Serial pattern, year break, guide tip.'} className='w-full border rounded-md px-3 py-2'></textarea>
        </div>

        <div className='grid gap-3 md:grid-cols-2'>
          <div>
            <label className='text-sm'>Contact Email <span className='text-muted-foreground'>(optional; for follow-up)</span></label>
            <input name='email' type='email' placeholder='you@company.com' className='w-full border rounded-md px-3 py-2' />
          </div>
          <div className='text-xs text-muted-foreground md:pt-6'>No sensitive/customer data. Submissions are reviewed and may be edited for clarity.</div>
        </div>

        {err ? <div className='text-sm text-red-600'>{err}</div> : null}
        {ok ? <div className='text-sm text-green-700'>Thanks! Your tip was received and is pending review.</div> : null}

        <button disabled={loading} className='px-4 py-2 rounded-md border bg-brand/5 border-brand-accent'>
          {loading ? 'Submitting…' : 'Submit tip'}
        </button>
      </form>
    </section>
  );
}
