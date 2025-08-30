import 'server-only';
import { requireAdminServer } from '@/lib/admin/guard';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export default async function AdminRosterPage({ searchParams }: { searchParams?: Record<string, string | undefined> }) {
  const adm = await requireAdminServer();
  if (!adm.ok) {
    return (
      <main className="container mx-auto p-4">
        <h2 className="text-lg font-semibold">403</h2>
        <p className="text-sm">Admins only.</p>
      </main>
    );
  }

  const sb = supabaseService();

  const qCourse = searchParams?.course_id ? String(searchParams.course_id) : undefined;
  const qStatus = searchParams?.status ? String(searchParams.status) : undefined; // 'passed'|'failed'|'all'
  const qText = (searchParams?.q || '').trim();

  // Enrollments with joined profile (if exists)
  let roster: any[] = [];
  try {
    const { data: enrs } = await sb
      .from('enrollments')
      .select('id, user_id, course_id, progress_pct, passed, created_at, profiles:profiles(full_name, email)')
      .order('created_at', { ascending: false });
    roster = enrs || [];
  } catch {
    // Fallback if profiles join fails
    const { data: enrs } = await sb
      .from('enrollments')
      .select('id, user_id, course_id, progress_pct, passed, created_at')
      .order('created_at', { ascending: false });
    roster = enrs || [];
  }

  // Attach latest exam attempt (if table present)
  let attemptsByUser = new Map<string, any>();
  try {
    const { data: atts } = await sb
      .from('exam_attempts')
      .select('user_id, score_pct, passed, created_at')
      .order('created_at', { ascending: false });
    for (const a of atts || []) {
      if (!attemptsByUser.has(a.user_id)) {
        attemptsByUser.set(a.user_id, a);
      }
    }
  } catch {
    // exam_attempts table might not exist
  }

  // Attach latest practical eval by enrollment (if present)
  let evalByEnrollment = new Map<string, any>();
  try {
    const { data: evals } = await sb
      .from('employer_evaluations')
      .select('enrollment_id, practical_pass, evaluation_date, evaluator_name, signature_url')
      .order('evaluation_date', { ascending: false });
    for (const e of evals || []) {
      if (!evalByEnrollment.has(e.enrollment_id)) {
        evalByEnrollment.set(e.enrollment_id, e);
      }
    }
  } catch {
    // employer_evaluations table might not exist
  }

  // Attach certificate urls (optional)
  let certByEnrollment = new Map<string, any>();
  try {
    const { data: certs } = await sb
      .from('certificates')
      .select('enrollment_id, pdf_url, issued_at')
      .order('issued_at', { ascending: false });
    for (const c of certs || []) {
      if (!certByEnrollment.has(c.enrollment_id)) {
        certByEnrollment.set(c.enrollment_id, c);
      }
    }
  } catch {
    // certificates table might not exist
  }

  // Enrich and filter
  let rows = roster.map(r => {
    const att = attemptsByUser.get(r.user_id);
    const pe = evalByEnrollment.get(r.id);
    const cert = certByEnrollment.get(r.id);
    return {
      enrollment_id: r.id,
      course_id: r.course_id,
      user_id: r.user_id,
      name: r.profiles?.full_name || '',
      email: r.profiles?.email || '',
      progress_pct: r.progress_pct ?? 0,
      passed: !!r.passed,
      last_score: att?.score_pct ?? null,
      practical_pass: pe?.practical_pass ?? null,
      evaluation_date: pe?.evaluation_date ?? null,
      certificate_url: cert?.pdf_url ?? null,
      created_at: r.created_at
    };
  });

  // Apply filters
  if (qCourse) {
    rows = rows.filter(x => x.course_id === qCourse);
  }
  if (qStatus === 'passed') {
    rows = rows.filter(x => x.passed);
  }
  if (qStatus === 'failed') {
    rows = rows.filter(x => !x.passed);
  }
  if (qText) {
    const t = qText.toLowerCase();
    rows = rows.filter(x => 
      x.email?.toLowerCase().includes(t) || 
      x.name?.toLowerCase().includes(t) || 
      x.user_id?.includes(t)
    );
  }

  const exportHref = `/api/admin/roster/export?token=${encodeURIComponent(process.env.ADMIN_EXPORT_TOKEN || '')}`;

  return (
    <main className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#0F172A] dark:text-white">
          Training Roster
        </h2>
        <a 
          className="rounded-2xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition" 
          href={exportHref}
        >
          Export CSV
        </a>
      </div>
      
      <form className="flex flex-wrap gap-2 text-sm">
        <input 
          name="q" 
          defaultValue={qText} 
          className="rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800" 
          placeholder="Search name/email/user_id" 
        />
        <select 
          name="status" 
          defaultValue={qStatus || 'all'} 
          className="rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800"
        >
          <option value="all">All Status</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
        </select>
        <input 
          name="course_id" 
          defaultValue={qCourse || ''} 
          className="rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800" 
          placeholder="Course ID (optional)" 
        />
        <button 
          type="submit"
          className="rounded-2xl bg-[var(--brand-orange)] text-white px-3 py-2 hover:bg-orange-600 transition"
        >
          Filter
        </button>
      </form>
      
      <div className="text-xs text-slate-500 mb-2">
        Showing {rows.length} enrollment{rows.length !== 1 ? 's' : ''}
      </div>
      
      <div className="overflow-x-auto border rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="text-left p-2 font-medium">Enrollment</th>
              <th className="text-left p-2 font-medium">User</th>
              <th className="text-left p-2 font-medium">Progress</th>
              <th className="text-left p-2 font-medium">Exam</th>
              <th className="text-left p-2 font-medium">Practical</th>
              <th className="text-left p-2 font-medium">Certificate</th>
              <th className="text-left p-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map(r => (
              <tr key={r.enrollment_id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <td className="p-2 font-mono text-xs">
                  {r.enrollment_id.slice(0, 8)}...
                </td>
                <td className="p-2">
                  <div className="font-medium">{r.name || '—'}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {r.email || r.user_id}
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span>{Math.round(r.progress_pct || 0)}%</span>
                    {r.passed && (
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded">
                        Passed
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-2">
                  {r.last_score != null ? (
                    <span className={`${r.last_score >= 80 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                      {Math.round(r.last_score)}%
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="p-2">
                  {r.practical_pass == null ? (
                    <span className="text-slate-400">—</span>
                  ) : r.practical_pass ? (
                    <span className="text-emerald-700 dark:text-emerald-400">Passed</span>
                  ) : (
                    <span className="text-red-700 dark:text-red-400">Failed</span>
                  )}
                </td>
                <td className="p-2">
                  {r.certificate_url ? (
                    <a 
                      className="text-blue-600 dark:text-blue-400 underline hover:no-underline" 
                      href={r.certificate_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      PDF
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="p-2 text-xs text-slate-600 dark:text-slate-400">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  <div className="space-y-2">
                    <div className="text-2xl">📋</div>
                    <p>No enrollments found</p>
                    <p className="text-xs">Try adjusting your filters or check back later</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {rows.length > 0 && (
        <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Roster Data Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-blue-800 dark:text-blue-200">
            <div>
              <div className="font-medium">Total Enrollments</div>
              <div>{rows.length}</div>
            </div>
            <div>
              <div className="font-medium">Passed</div>
              <div>{rows.filter(r => r.passed).length}</div>
            </div>
            <div>
              <div className="font-medium">With Certificates</div>
              <div>{rows.filter(r => r.certificate_url).length}</div>
            </div>
            <div>
              <div className="font-medium">Practical Completed</div>
              <div>{rows.filter(r => r.practical_pass !== null).length}</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
