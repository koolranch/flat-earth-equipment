import { supabaseServer } from '@/lib/supabase/server';
import AssignSeatsPanel from '@/components/trainer/AssignSeatsPanel';
import TrainerTabs from '@/components/trainer/TrainerTabs';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  
  if (!user) {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-xl font-bold">Sign in required</h1>
        <p className="text-sm mt-1">Please sign in to access trainer tools.</p>
      </main>
    );
  }
  
  const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['trainer', 'admin'].includes(prof.role)) {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-xl font-bold">Trainer access required</h1>
        <p className="text-sm mt-1">You need trainer or admin permissions to access this page.</p>
      </main>
    );
  }

  // Get default course (forklift course)
  const { data: course } = await sb
    .from('courses')
    .select('id, title')
    .ilike('slug', '%forklift%')
    .limit(1)
    .maybeSingle();

  if (!course) {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-xl font-bold">No course found</h1>
        <p className="text-sm mt-1">Please contact an administrator to set up courses.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trainer Tools</h1>
          <p className="text-sm text-slate-600">Manage learners and track progress for {course.title}</p>
        </div>
        <a 
          className="rounded-2xl border border-[#F76511] text-[#F76511] px-4 py-2 text-sm hover:bg-[#F76511] hover:text-white transition-colors" 
          href={`/api/trainer/export.csv?course_id=${course.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          📊 Export CSV
        </a>
      </header>
      
      {/* Assign Seats Panel */}
      <AssignSeatsPanel />
      
      {/* Tabbed Interface for Roster and Invites */}
      <TrainerTabs courseId={course.id} />
    </main>
  );
}