'use client'

import React from 'react';
import CopyButton from './CopyButton';

type VerifyResponse = {
  ok: boolean;
  status?: 'valid' | 'revoked' | 'not_found';
  certificate?: {
    verify_code: string;
    issued_at?: string | null;
    pdf_url?: string | null;
    course_slug?: string | null;
    full_name?: string | null;
    trainer_signature_url?: string | null;
    trainee_signature_url?: string | null;
    revoked_reason?: string | null;
  };
};

export default function VerifyClient({ code }: { code: string }) {
  const [data, setData] = React.useState<VerifyResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch(`/api/verify/${code}`, { cache: 'no-store' });
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ ok: false, status: 'not_found' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [code]);

  const url = `/verify/${code}`;

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 grid gap-6">
        <h1 className="text-2xl font-semibold">Certificate Verification</h1>
        <div className="rounded border p-4">Loading…</div>
      </main>
    );
  }

  if (!data?.ok) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 grid gap-6">
        <h1 className="text-2xl font-semibold">Certificate Verification</h1>
        <div className="rounded border border-rose-500 p-4">
          <div className="font-medium text-rose-700">Not found</div>
          <p className="text-sm text-slate-700">We couldn't find a certificate for code <span className="font-mono">{code}</span>.</p>
        </div>
      </main>
    );
  }

  const c = data.certificate!;
  const valid = data.status === 'valid';

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 grid gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Certificate Verification</h1>
        <CopyButton url={url} />
      </div>

      <section className={`rounded border p-5 ${valid ? 'border-green-600' : 'border-amber-600'}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-wide text-slate-500">Status</div>
            <div className={`text-lg font-semibold ${valid ? 'text-green-700' : 'text-amber-700'}`}>{valid ? 'Valid' : 'Revoked'}</div>
          </div>
          <div>
            <div className="text-sm uppercase tracking-wide text-slate-500">Verify Code</div>
            <div className="font-mono text-slate-800">{c.verify_code}</div>
          </div>
          <div>
            <div className="text-sm uppercase tracking-wide text-slate-500">Issued</div>
            <div className="text-slate-800">{c.issued_at ? new Date(c.issued_at).toLocaleDateString() : '—'}</div>
          </div>
        </div>
        <div className="mt-4 grid gap-1">
          <div className="text-sm uppercase tracking-wide text-slate-500">Learner</div>
          <div className="text-lg text-slate-900">{c.full_name || 'Learner'}</div>
          <div className="text-sm text-slate-600">Course: {c.course_slug || '—'}</div>
        </div>

        {!valid && c.revoked_reason && (
          <p className="mt-3 text-sm text-amber-800">Reason: {c.revoked_reason}</p>
        )}

        {(c.trainer_signature_url || c.trainee_signature_url) && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {c.trainee_signature_url && (
              <div>
                <div className="text-sm text-slate-500 mb-1">Trainee Signature</div>
                <img src={c.trainee_signature_url} alt="Trainee signature" className="max-h-24 object-contain border rounded p-2 bg-white" />
              </div>
            )}
            {c.trainer_signature_url && (
              <div>
                <div className="text-sm text-slate-500 mb-1">Trainer Signature</div>
                <img src={c.trainer_signature_url} alt="Trainer signature" className="max-h-24 object-contain border rounded p-2 bg-white" />
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          {c.pdf_url && (
            <a href={c.pdf_url} className="rounded bg-white border px-3 py-2 text-sm" target="_blank" rel="noreferrer">Download full certificate PDF</a>
          )}
          <form action="/api/certificates/wallet" method="post">
            <input type="hidden" name="code" value={c.verify_code} />
            <button className="rounded bg-slate-900 text-white px-3 py-2 text-sm" type="submit">Get wallet card PDF</button>
          </form>
        </div>
      </section>
    </main>
  );
}


