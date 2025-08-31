// app/records/page.tsx
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

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
  
  const { data: certs } = await supabase.from('certificates').select('id,issue_date,score,verifier_code,pdf_url,verification_code').order('issue_date', { ascending: false }).limit(20);
  
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

      {/* Certificates */}
      <div className="grid gap-3">
        {(certs||[]).map(c => (
          <div key={c.id} className="rounded-2xl border p-4 shadow-lg">
            <div className="text-sm text-slate-700 dark:text-slate-200">{L('records.certificate', locale)} — {c.issue_date} — {c.score}%</div>
            {c.verification_code && (
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="text-slate-500">Verification Code: </span>
                <span className="font-mono">{c.verification_code}</span>
              </div>
            )}
            <div className="mt-2 flex gap-2">
              {c.pdf_url ? <a className="rounded-2xl bg-[#F76511] text-white px-3 py-2" href={c.pdf_url} target="_blank" rel="noopener noreferrer">{L('records.download', locale)}</a> : null}
              {c.verification_code ? (
                <a className="rounded-2xl border px-3 py-2" href={`/verify/${c.verification_code}`} target="_blank">{L('records.verify', locale)}</a>
              ) : c.verifier_code ? (
                <a className="rounded-2xl border px-3 py-2" href={`/verify/${c.verifier_code}`}>{L('records.verify', locale)}</a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}