// app/records/page.tsx
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import CertificateActions from '@/components/records/CertificateActions';
import { getDict, tFrom, type Locales } from '@/lib/i18n';

export default async function Page() {
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
  const dict = getDict(locale as Locales);
  const t = (path: string, params?: Record<string, any>) => tFrom(dict, path, params);
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  // Get current user for evaluation lookup
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: certs } = await supabase
    .from('certificates')
    .select('id,issue_date,score,verifier_code,pdf_url,verification_code,enrollment_id,employer_evaluations(practical_pass)')
    .order('issue_date', { ascending: false })
    .limit(20);

  // Fetch exam attempts for each enrollment to show scores and attempt counts
  const examByEnroll: Record<string, { score_pct: number; attempts: number }> = {};
  if (certs?.length) {
    const enrollmentIds = certs.map(c => c.enrollment_id).filter(Boolean);
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select('enrollment_id, score_pct, created_at, passed')
      .in('enrollment_id', enrollmentIds)
      .order('created_at', { ascending: false });
    
    if (attempts) {
      const counts: Record<string, number> = {};
      for (const attempt of attempts) {
        const enrollId = attempt.enrollment_id;
        counts[enrollId] = (counts[enrollId] || 0) + 1;
        
        // Store the latest (first due to DESC order) attempt details
        if (!(enrollId in examByEnroll)) {
          examByEnroll[enrollId] = { 
            score_pct: attempt.score_pct, 
            attempts: counts[enrollId] 
          };
        } else {
          // Update attempt count for this enrollment
          examByEnroll[enrollId].attempts = counts[enrollId];
        }
      }
    }
  }
  
  // Get latest practical evaluation if user is authenticated
  const { data: evalRow } = user ? await supabase
    .from('employer_evaluations')
    .select('id, evaluation_date, practical_pass, evaluator_name, signature_url, enrollment_id')
    .eq('trainee_user_id', user.id)
    .order('evaluation_date', { ascending: false })
    .limit(1)
    .maybeSingle() : { data: null };
  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">{t('records.title')}</h1>
      
      {/* Supervisor Evaluation Status */}
      <section className="rounded-2xl border p-4 bg-white dark:bg-slate-900 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-2">{t('eval.title')}</h2>
        {evalRow ? (
          <div className="text-sm">
            <div>{t('eval.result')}: <span className={evalRow.practical_pass ? 'text-emerald-700' : 'text-rose-700'}>{evalRow.practical_pass ? t('eval.pass_label') : t('eval.needs_refresher')}</span></div>
            <div>{t('eval.date')}: {evalRow.evaluation_date}</div>
            <div>{t('eval.evaluator_name')}: {evalRow.evaluator_name}</div>
            {evalRow.signature_url ? <div className="mt-2"><img src={evalRow.signature_url} alt="Supervisor signature" className="h-16"/></div> : null}
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-300">{t('records.no_records')} <a className="underline" href="/practical/start">{t('common.start')}</a>.</div>
        )}
      </section>

      {/* Certificates Table */}
      <section className="rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b">
              <tr>
                <th className="text-left p-3 font-medium">{t('records.title')}</th>
                <th className="text-left p-3 font-medium">{t('verify.issued')}</th>
                <th className="text-left p-3 font-medium">{t('verify.practical')}</th>
                <th className="text-left p-3 font-medium">{t('records.exam_col')}</th>
                <th className="text-left p-3 font-medium">{t('records.verification')}</th>
                <th className="text-left p-3 font-medium">{t('common.submit')}</th>
              </tr>
            </thead>
            <tbody>
              {(certs && certs.length > 0) ? certs.map(c => (
                <tr key={c.id} className="border-b last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="p-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {t('records.title')}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      ID: {c.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-700 dark:text-slate-300">
                      {new Date(c.issue_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-3">
                    {c.employer_evaluations?.[0]?.practical_pass ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-2 py-1 text-xs font-medium">
                        ✓ Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-2 py-1 text-xs">
                        — Pending
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {examByEnroll[c.enrollment_id] ? (
                      <div className="space-y-1">
                        <div className={`font-medium ${examByEnroll[c.enrollment_id].score_pct >= 80 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {examByEnroll[c.enrollment_id].score_pct}%
                        </div>
                        <div className="text-xs text-slate-500">
                          {examByEnroll[c.enrollment_id].attempts} {t('records.attempts')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    {c.verification_code && (
                      <div className="space-y-1">
                        <div className="font-mono text-xs text-slate-600 dark:text-slate-400">
                          {c.verification_code}
                        </div>
                        <a 
                          className="text-xs text-blue-600 hover:text-blue-800 underline" 
                          href={`/verify/${c.verification_code}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('records.verification')}
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    {c.verification_code && (
                      <CertificateActions
                        verificationCode={c.verification_code}
                        pdfUrl={c.pdf_url}
                        baseUrl={process.env.NEXT_PUBLIC_BASE_URL || 'https://flatearthequipment.com'}
                      />
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    {t('records.no_records')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}