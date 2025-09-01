'use client';
import { useEffect, useState } from 'react';

export default function AssignSeatsPanel() {
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState<string>('');
  const [raw, setRaw] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [sendEmails, setSendEmails] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => { 
    (async () => {
      const r = await fetch('/api/courses');
      if (r.ok) { 
        const j = await r.json(); 
        setCourses(j?.data || []); 
        if (j?.data?.[0]) setCourseId(j.data[0].id); 
      }
    })(); 
  }, []);

  function parseRaw(value: string) {
    const parts = value.split(/\n|,|;|\s+/).map(s => s.trim().toLowerCase()).filter(Boolean);
    const uniq = Array.from(new Set(parts.filter(x => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x))));
    setEmails(uniq);
  }

  async function onCSV(file: File) {
    const text = await file.text();
    // simple CSV parse: find emails by regex; keeps DX minimal
    const found = Array.from(new Set((text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map(x => x.toLowerCase())));
    setRaw(found.join('\n'));
    setEmails(found);
  }

  async function submit() {
    if (!courseId || emails.length === 0) return;
    setLoading(true);
    setResult(null);

    try {
      // Step 1: Create bulk invitations
      const r1 = await fetch('/api/trainer/seat-invites/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          course_id: courseId, 
          emails, 
          note: note.trim() || undefined 
        })
      });
      
      const j1 = await r1.json();
      if (!j1.ok) {
        setLoading(false);
        setResult({ error: `Failed to create invitations: ${j1.error}` });
        return;
      }

      // Step 2: Send email invitations (if enabled)
      let emailResult = null;
      if (sendEmails) {
        const r2 = await fetch('/api/trainer/seat-invites/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course_id: courseId })
        });
        
        const j2 = await r2.json();
        if (!j2.ok) {
          setResult({ 
            ...j1, 
            email_error: `Failed to send emails: ${j2.error}`,
            created_only: true 
          });
          setLoading(false);
          return;
        }
        emailResult = j2;
      }

      // Combine results
      const combinedResult = {
        ...j1,
        email_result: emailResult,
        success: true,
        created_count: j1.count || 0,
        sent_count: emailResult?.sent || 0,
        failed_count: emailResult?.failed || 0
      };

      setResult(combinedResult);
      
      // Clear form on success
      setRaw('');
      setEmails([]);
      setNote('');

    } catch (error) {
      console.error('Error in invitation workflow:', error);
      setResult({ error: 'Unexpected error occurred. Please try again.' });
    }
    
    setLoading(false);
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Assign Seats</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="text-sm">Course
          <select 
            value={courseId} 
            onChange={e => setCourseId(e.target.value)} 
            className="block w-full rounded-xl border px-3 py-2 mt-1"
          >
            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">Paste emails (one per line)
          <textarea 
            value={raw} 
            onChange={e => { setRaw(e.target.value); parseRaw(e.target.value); }} 
            rows={6} 
            className="block w-full rounded-xl border px-3 py-2 mt-1 font-mono" 
            placeholder="worker1@example.com&#10;worker2@example.com"
          />
        </label>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">Note (optional)
          <input 
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Training batch #1, Department A, etc."
            className="block w-full rounded-xl border px-3 py-2 mt-1"
          />
        </label>
        <label className="text-sm flex items-center gap-2 mt-6">
          <input 
            type="checkbox"
            checked={sendEmails}
            onChange={e => setSendEmails(e.target.checked)}
            className="rounded"
          />
          Send email invitations automatically
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input 
          type="file" 
          accept=".csv,text/csv" 
          onChange={e => e.target.files && onCSV(e.target.files[0])} 
          className="text-sm file:rounded-xl file:border file:px-3 file:py-1 file:text-sm file:bg-slate-50 hover:file:bg-slate-100"
        />
        <span className="text-xs text-slate-500">{emails.length} valid emails parsed</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          {emails.length > 0 && (
            <span>Ready to process <strong>{emails.length}</strong> email{emails.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <button 
          onClick={submit} 
          disabled={loading || !courseId || emails.length === 0} 
          className="rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing…' : sendEmails ? 'Create & Send Invites' : 'Create Invites Only'}
        </button>
      </div>

      {result && (
        <div className="mt-4 space-y-3">
          {result.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <div className="font-medium">Error</div>
              <div>{result.error}</div>
            </div>
          ) : (
            <>
              {/* Success Summary */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
                <div className="font-medium text-emerald-800 mb-2">
                  {result.success ? '✅ Invitations Processed Successfully' : 'Partial Success'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-emerald-700">
                  <div>Created: <strong>{result.created_count || 0}</strong></div>
                  {result.email_result && (
                    <>
                      <div>Emails Sent: <strong>{result.sent_count || 0}</strong></div>
                      {result.failed_count > 0 && (
                        <div className="col-span-2 text-amber-700">
                          Failed to send: <strong>{result.failed_count}</strong>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {result.course_title && (
                  <div className="mt-2 text-xs text-emerald-600">
                    Course: {result.course_title}
                  </div>
                )}
              </div>

              {/* Email Errors */}
              {result.email_error && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <div className="font-medium">Email Warning</div>
                  <div>{result.email_error}</div>
                  <div className="text-xs mt-1">Invitations were created but emails failed to send.</div>
                </div>
              )}

              {/* Detailed Results */}
              {result.summary && (
                <div className="rounded-xl border p-3 text-sm bg-slate-50">
                  <div className="font-medium mb-2">Summary</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>Total Submitted: {result.summary.total_submitted}</div>
                    <div>Valid Emails: {result.summary.valid_count}</div>
                    {result.summary.invalid_count > 0 && (
                      <div className="col-span-2 text-amber-700">
                        Invalid Emails: {result.summary.invalid_count}
                      </div>
                    )}
                    {result.email_result?.summary && (
                      <div className="col-span-2 mt-2 pt-2 border-t">
                        <div className="text-xs font-medium">Email Delivery</div>
                        <div>Success Rate: {result.email_result.summary.success_rate}%</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Invalid Emails */}
              {result.invalid_emails && result.invalid_emails.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
                  <div className="font-medium text-amber-800 mb-1">Invalid Emails Skipped</div>
                  <div className="text-xs text-amber-700 space-y-1">
                    {result.invalid_emails.map((email: string, i: number) => (
                      <div key={i} className="font-mono">{email}</div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
