// app/records/page.tsx
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import CertificateActions from '@/components/records/CertificateActions';

const L = (k: string, locale: string) => {
  const en: any = { 
    'records.title': 'Records', 
    'records.certificate': 'Certificate', 
    'records.download': 'Download PDF', 
    'records.verify': 'Verify',
    'records.eval': 'Supervisor Evaluation',
    'records.status': 'Status',
    'records.date': 'Date', 
    'records.supervisor': 'Supervisor',
    'records.none': 'No practical evaluation on file yet.',
    'records.start_now': 'Start now'
  };
  const es: any = { 
    'records.title': 'Registros', 
    'records.certificate': 'Certificado', 
    'records.download': 'Descargar PDF', 
    'records.verify': 'Verificar',
    'records.eval': 'Evaluación del supervisor',
    'records.status': 'Estado',
    'records.date': 'Fecha',
    'records.supervisor': 'Supervisor', 
    'records.none': 'Aún no hay evaluación práctica.',
    'records.start_now': 'Iniciar ahora'
  };
  return (locale==='es'?es:en)[k];
};

export default async function Page() {
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
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
      <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">{L('records.title', locale)}</h1>
      
      {/* Supervisor Evaluation Status */}
      <section className="rounded-2xl border p-4 bg-white dark:bg-slate-900 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-2">{L('records.eval', locale)}</h2>
        {evalRow ? (
          <div className="text-sm">
            <div>{L('records.status', locale)}: <span className={evalRow.practical_pass ? 'text-emerald-700' : 'text-rose-700'}>{evalRow.practical_pass ? 'Passed' : 'Failed'}</span></div>
            <div>{L('records.date', locale)}: {evalRow.evaluation_date}</div>
            <div>{L('records.supervisor', locale)}: {evalRow.evaluator_name}</div>
            {evalRow.signature_url ? <div className="mt-2"><img src={evalRow.signature_url} alt="Supervisor signature" className="h-16"/></div> : null}
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-300">{L('records.none', locale)} <a className="underline" href="/practical/start">{L('records.start_now', locale)}</a>.</div>
        )}
      </section>

      {/* Certificates Table */}
      <section className="rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Certificate</th>
                <th className="text-left p-3 font-medium">Issued</th>
                <th className="text-left p-3 font-medium">Practical</th>
                <th className="text-left p-3 font-medium">Exam Score</th>
                <th className="text-left p-3 font-medium">Verification</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(certs && certs.length > 0) ? certs.map(c => (
                <tr key={c.id} className="border-b last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="p-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {L('records.certificate', locale)}
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
                          {examByEnroll[c.enrollment_id].attempts} attempt{examByEnroll[c.enrollment_id].attempts > 1 ? 's' : ''}
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
                          {L('records.verify', locale)}
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
                    No certificates found. Complete your training and pass the final exam to earn your certificate.
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