import React from 'react';

export const dynamic = 'force-dynamic';

async function getVerify(code: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || '';
  const res = await fetch(`${base}/api/verify?code=${encodeURIComponent(code)}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function Page({ params }: { params: { code: string } }) {
  const data = await getVerify(params.code);
  if (!data) return (
    <main className="container mx-auto p-4">
      <h1 className="text-xl font-bold">Verification</h1>
      <p className="text-sm mt-1">Invalid or not found.</p>
    </main>
  );

  const { ok, valid, expired, details } = data;
  if (!ok) return (
    <main className="container mx-auto p-4">
      <h1 className="text-xl font-bold">Verification</h1>
      <p className="text-sm mt-1">Invalid or not found.</p>
    </main>
  );

  return (
    <main className="container mx-auto p-4 space-y-3">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Verification</h1>
        <span className={`rounded-full px-3 py-1 text-sm ${
          valid && !expired 
            ? 'bg-emerald-100 text-emerald-800' 
            : expired 
            ? 'bg-amber-100 text-amber-800'
            : 'bg-rose-100 text-rose-800'
        }`}>
          {valid && !expired ? 'VALID' : expired ? 'EXPIRED' : 'INVALID'}
        </span>
      </header>

      <section className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-slate-500">Name</div>
            <div className="font-medium">{details?.name || details?.email}</div>
          </div>
          <div>
            <div className="text-slate-500">Course</div>
            <div className="font-medium">{details?.course_title}</div>
          </div>
          <div>
            <div className="text-slate-500">Issued</div>
            <div className="font-medium">{new Date(details?.issued_at).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-slate-500">Expires</div>
            <div className="font-medium">{new Date(details?.expires_at).toLocaleDateString()}</div>
          </div>
        </div>
        {details?.practical_verified && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm">
            PRACTICAL VERIFIED
          </div>
        )}
        <div className="mt-3">
          {details?.pdf_url ? (
            <a className="underline text-sm" href={details.pdf_url} target="_blank">
              View certificate PDF
            </a>
          ) : (
            <span className="text-sm text-slate-500">PDF not available</span>
          )}
        </div>
      </section>
      <p className="text-xs text-slate-500">Flat Earth Safety • No-BS training for real operators.</p>
    </main>
  );
}