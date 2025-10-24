import type { Metadata } from 'next';

async function fetchVerification(code: string) {
  // Prefer relative URL in production if base is not configured to avoid SSR fetch errors
  const base = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  const apiUrl = `${base}/api/verify/${code}`;
  const res = await fetch(apiUrl, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const data = await fetchVerification(params.code);
  const titleBase = 'Forklift Certification Verification';
  if (!data?.ok) return { title: `${titleBase} · Not found` };
  const name = data.certificate?.full_name || 'Learner';
  const valid = data.status === 'valid';
  const title = `${titleBase} · ${valid ? 'Valid' : 'Revoked'} · ${name}`;
  return {
    title,
    openGraph: {
      title,
      description: valid ? `Valid certificate for ${name}` : `Certificate revoked for ${name}`,
      type: 'website'
    },
    twitter: { card: 'summary', title }
  };
}

function CopyButton({ url }: { url: string }) {
  'use client';
  const [copied, setCopied] = require('react').useState(false);
  return (
    <button
      onClick={async () => { const href = url.startsWith('/') ? new URL(url, window.location.origin).toString() : url; await navigator.clipboard.writeText(href); setCopied(true); setTimeout(()=>setCopied(false), 1500); }}
      className="rounded bg-slate-900 text-white px-3 py-2 text-sm">
      {copied ? 'Copied' : 'Copy link'}
    </button>
  );
}

export default async function VerifyPage({ params }: { params: { code: string } }) {
  const data = await fetchVerification(params.code);
  const base = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  const url = `${base}/verify/${params.code}`; // may be relative

  if (!data?.ok) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 grid gap-6">
        <h1 className="text-2xl font-semibold">Certificate Verification</h1>
        <div className="rounded border border-rose-500 p-4">
          <div className="font-medium text-rose-700">Not found</div>
          <p className="text-sm text-slate-700">We couldn't find a certificate for code <span className="font-mono">{params.code}</span>.</p>
        </div>
      </main>
    );
  }

  const c = data.certificate;
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
          <div className="text-sm text-slate-600">Course: {c.course_slug}</div>
        </div>

        {(!valid && c.revoked_reason) && (
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