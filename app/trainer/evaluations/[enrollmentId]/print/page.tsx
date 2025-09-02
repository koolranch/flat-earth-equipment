import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { enrollmentId: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return <main className="container mx-auto p-4">Sign in.</main>;
  const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['trainer', 'admin'].includes(prof.role)) return <main className="container mx-auto p-4">Trainer access required.</main>;

  const { data: row } = await sb
    .from('employer_evaluations')
    .select('*')
    .eq('enrollment_id', params.enrollmentId)
    .maybeSingle();
  if (!row) return <main className="container mx-auto p-4">No evaluation found.</main>;

  const comp = row.competencies || {};

  return (
    <main className="mx-auto p-6 print:p-0 max-w-3xl bg-white text-slate-900">
      <h1 className="text-2xl font-bold mb-2">Forklift Operator Practical Evaluation</h1>
      <div className="text-sm text-slate-600 mb-4">CFR 29 §1910.178(l) — Employer evaluation & recordkeeping</div>

      <section className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div><div className="font-medium">Evaluator</div><div>{row.evaluator_name || '—'}</div><div className="text-slate-600">{row.evaluator_title || '—'}</div></div>
        <div><div className="font-medium">Site</div><div>{row.site_location || '—'}</div><div>Date: {row.evaluation_date ? new Date(row.evaluation_date).toLocaleDateString() : '—'}</div></div>
      </section>

      <section className="mb-4">
        <div className="font-medium mb-1">Competencies</div>
        <ul className="grid grid-cols-2 gap-1 text-sm">
          {Object.entries({
            preop: 'Pre-operation inspection', controls: 'Controls & instrument use', travel: 'Safe travel', loadHandling: 'Load handling & stacking', pedestrians: 'Pedestrian safety', ramps: 'Ramps & inclines', stability: 'Stability triangle awareness', refuel: 'Refuel/charging', shutdown: 'Parking & shutdown'
          }).map(([k, label]) => (
            <li key={k}>[{comp[k] ? 'X' : ' '}] {label}</li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-medium mb-1">Evaluator signature</div>
          {row.evaluator_signature_url ? <img src={row.evaluator_signature_url} alt="Evaluator signature" className="border rounded" /> : <div className="text-slate-500">—</div>}
        </div>
        <div>
          <div className="font-medium mb-1">Trainee signature</div>
          {row.trainee_signature_url ? <img src={row.trainee_signature_url} alt="Trainee signature" className="border rounded" /> : <div className="text-slate-500">—</div>}
        </div>
      </section>

      <section className="mb-6">
        <div className="font-medium">Result</div>
        <div>{row.practical_pass === true ? 'PASS' : row.practical_pass === false ? 'NEEDS REFRESHER' : '—'}</div>
      </section>

      <footer className="text-xs text-slate-600 border-t pt-2">
        Keep this record for at least 3 years. Per §1910.178(l)(6), employer must retain training and evaluation records.
      </footer>
    </main>
  );
}
