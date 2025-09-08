'use client';

import { useState } from 'react';

export default function QAMakeUserPage() {
  const [token, setToken] = useState('');
  const [course, setCourse] = useState('forklift');
  const [locale, setLocale] = useState(process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en');
  const [prefix, setPrefix] = useState('qa');
  const [domain, setDomain] = useState('example.test');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | { ok?: boolean; email?: string; password?: string; course_slug?: string; locale?: string; error?: string }>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/qa/create-test-user', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-qa-token': token
        },
        body: JSON.stringify({ course_slug: course, locale, prefix, email_domain: domain }),
        cache: 'no-store'
      });
      const json = await res.json();
      setResult(json);
    } catch (err: any) {
      setResult({ error: err?.message || 'Request failed' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Create Live QA User</h1>
      <p className="text-sm text-slate-600">This calls <code>/api/qa/create-test-user</code>. You must paste the same <code>QA_USER_TOKEN</code> you set in Vercel.</p>

      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">QA Token</label>
          <input value={token} onChange={e=>setToken(e.target.value)} required placeholder="paste your QA_USER_TOKEN"
                 className="mt-1 w-full rounded border px-3 py-2" type="password" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Course</label>
            <input value={course} onChange={e=>setCourse(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Locale</label>
            <input value={locale} onChange={e=>setLocale(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Email prefix</label>
            <input value={prefix} onChange={e=>setPrefix(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email domain</label>
            <input value={domain} onChange={e=>setDomain(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </div>
        </div>

        <button disabled={busy} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
          {busy ? 'Creating…' : 'Create test user'}
        </button>
      </form>

      {result && (
        <div className="rounded border p-4">
          {result.ok ? (
            <div className="space-y-2">
              <div className="font-medium text-green-700">Success</div>
              <div><span className="font-mono text-sm">Email</span>: {result.email}</div>
              <div><span className="font-mono text-sm">Password</span>: {result.password}</div>
              <div><span className="font-mono text-sm">Course</span>: {result.course_slug}</div>
              <div><span className="font-mono text-sm">Locale</span>: {result.locale}</div>
            </div>
          ) : (
            <div className="text-red-700">{result.error || 'Unknown error'}</div>
          )}
        </div>
      )}

      <p className="text-xs text-slate-500">Security note: this page only works with a valid token. Remove it later or guard behind your admin role if you prefer.</p>
    </main>
  );
}
