import { supabaseServer } from '@/lib/supabase/server';
import EvalForm from '@/components/eval/EvalForm';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { enrollmentId: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return <main className="container mx-auto p-4">Sign in.</main>;
  const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['trainer', 'admin'].includes(prof.role)) return <main className="container mx-auto p-4">Trainer access required.</main>;

  const { data: evalRow } = await sb
    .from('employer_evaluations')
    .select('*')
    .eq('enrollment_id', params.enrollmentId)
    .maybeSingle();

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Practical Evaluation</h1>
      <EvalForm enrollmentId={params.enrollmentId} initial={evalRow || null} />
    </main>
  );
}
