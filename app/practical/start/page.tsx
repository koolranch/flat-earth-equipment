import { supabaseServer } from '@/lib/supabase/server';

export default async function Page(){
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  
  if (!user) {
    return (
      <main className="container mx-auto p-4">
        <p>Please sign in to start your supervisor evaluation.</p>
      </main>
    );
  }
  
  const { data: enr } = await sb
    .from('enrollments')
    .select('id, course_id, passed')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (!enr) {
    return (
      <main className="container mx-auto p-4">
        <p>No active enrollment found.</p>
      </main>
    );
  }
  
  return (
    <main className="container mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Supervisor Practical Evaluation</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">Have your supervisor complete this checklist and sign.</p>
      <a 
        className="inline-flex rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg" 
        href={`/practical/${enr.id}/start`}
      >
        Begin
      </a>
    </main>
  );
}
