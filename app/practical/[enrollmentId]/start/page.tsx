import { supabaseServer } from '@/lib/supabase/server';
import PracticalForm from '@/components/eval/PracticalForm';

export default async function Page({ params }: { params: { enrollmentId: string } }){
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  
  if (!user) {
    return (
      <main className="container mx-auto p-4">
        <p>Please sign in.</p>
      </main>
    );
  }
  
  // Basic ownership check: enrollment belongs to user
  const { data: enr, error } = await sb
    .from('enrollments')
    .select('id, user_id')
    .eq('id', params.enrollmentId)
    .maybeSingle();
  
  if (error || !enr || enr.user_id !== user.id) {
    return (
      <main className="container mx-auto p-4">
        <p>Enrollment not found.</p>
      </main>
    );
  }
  
  return (
    <main className="container mx-auto p-4">
      <PracticalForm enrollmentId={params.enrollmentId} traineeUserId={user.id} />
    </main>
  );
}