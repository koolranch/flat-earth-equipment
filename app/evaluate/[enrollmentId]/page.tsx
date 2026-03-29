import EvaluationForm from '@/components/trainer/EvaluationForm';
import { canManageEvaluations } from '@/lib/eval/auth.server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { enrollmentId: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return <main className="container mx-auto p-4">Sign in.</main>;
  }

  if (!(await canManageEvaluations(user.id))) {
    return <main className="container mx-auto p-4">Trainer or Manager access required.</main>;
  }

  return (
    <main className="container mx-auto p-4">
      <EvaluationForm enrollmentId={params.enrollmentId} />
    </main>
  );
}
