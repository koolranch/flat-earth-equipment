// app/records/page.tsx
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const L = (k: string, locale: string) => {
  const en: any = { 
    'records.title': 'Your Training Records', 
    'records.certificate': 'Certificate', 
    'records.download': 'Download PDF', 
    'records.verify': 'Verify' 
  };
  const es: any = { 
    'records.title': 'Tus registros de capacitación', 
    'records.certificate': 'Certificado', 
    'records.download': 'Descargar PDF', 
    'records.verify': 'Verificar' 
  };
  return (locale==='es'?es:en)[k];
};

export default async function Page() {
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: certs } = await supabase.from('certificates').select('id,issue_date,score,verifier_code,pdf_url').order('issue_date', { ascending: false }).limit(20);
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-[#0F172A]">{L('records.title', locale)}</h1>
      <div className="mt-4 grid gap-3">
        {(certs||[]).map(c => (
          <div key={c.id} className="rounded-2xl border p-4 shadow-lg">
            <div className="text-sm text-slate-700">{L('records.certificate', locale)} — {c.issue_date} — {c.score}%</div>
            <div className="mt-2 flex gap-2">
              {c.pdf_url ? <a className="rounded-2xl bg-[#F76511] text-white px-3 py-2" href={c.pdf_url} target="_blank" rel="noopener noreferrer">{L('records.download', locale)}</a> : null}
              <a className="rounded-2xl border px-3 py-2" href={`/verify/${c.verifier_code}`}>{L('records.verify', locale)}</a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}