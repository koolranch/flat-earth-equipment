import { supabaseServer } from '@/lib/supabase/server';
import PracticalInviteForm from '@/components/practical/PracticalInviteForm';

export default async function Page(){
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  
  if (!user) {
    return (
      <main className="container mx-auto max-w-4xl p-6">
        <div className="rounded-2xl border bg-white p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Practical Evaluation Required</h1>
          <p className="text-slate-600 mb-6">Please sign in to continue with your hands-on evaluation.</p>
          <a href="/login" className="inline-flex rounded-2xl bg-[#F76511] text-white px-6 py-3 font-medium">
            Sign In
          </a>
        </div>
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
      <main className="container mx-auto max-w-4xl p-6">
        <div className="rounded-2xl border bg-white p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No Enrollment Found</h1>
          <p className="text-slate-600 mb-6">You need to be enrolled in a course first.</p>
          <a href="/training" className="inline-flex rounded-2xl bg-[#F76511] text-white px-6 py-3 font-medium">
            View Courses
          </a>
        </div>
      </main>
    );
  }
  
  // Check if evaluation already exists
  const { data: existingEval } = await sb
    .from('employer_evaluations')
    .select('id, practical_pass, evaluation_date')
    .eq('enrollment_id', enr.id)
    .maybeSingle();
  
  return (
    <main className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="rounded-2xl border bg-white p-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Hands-On Practical Evaluation</h1>
        <p className="text-lg text-slate-600 mb-6">
          OSHA requires workplace evaluation by a qualified person before independent forklift operation.
        </p>
        
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-orange-900 mb-3">📋 What's Required</h2>
          <ul className="space-y-2 text-sm text-orange-900">
            <li className="flex items-start gap-2">
              <span className="text-[#F76511] font-bold">•</span>
              <span><strong>Qualified evaluator:</strong> Supervisor, safety manager, or experienced operator</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F76511] font-bold">•</span>
              <span><strong>On-site assessment:</strong> Demonstrates competency on actual equipment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F76511] font-bold">•</span>
              <span><strong>Documentation:</strong> Evaluator signs off on specific competencies per 29 CFR 1910.178(l)</span>
            </li>
          </ul>
        </div>
        
        {existingEval?.practical_pass && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">✓</div>
              <div>
                <h3 className="font-semibold text-green-900">Practical Evaluation Completed</h3>
                <p className="text-sm text-green-700">Completed on {new Date(existingEval.evaluation_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">Two Easy Options:</h2>
          
          {/* Option 1: Invite Supervisor */}
          <div className="rounded-xl border-2 border-[#F76511] bg-orange-50 p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Option 1: Invite Your Safety Manager</h3>
            <p className="text-sm text-orange-800 mb-4">
              Send an email invite to your supervisor or safety manager. They'll receive a link to complete the evaluation.
            </p>
            
            <PracticalInviteForm enrollmentId={enr.id} userId={user.id} />
          </div>
          
          {/* Option 2: Start with Supervisor */}
          <div className="rounded-xl border bg-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Option 2: Start with Supervisor Present</h3>
            <p className="text-sm text-slate-700 mb-4">
              If your supervisor is with you now, start the evaluation together.
            </p>
            <a 
              className="inline-flex rounded-2xl bg-[#F76511] text-white px-6 py-3 font-medium hover:bg-orange-600 transition-colors" 
              href={`/practical/${enr.id}/start`}
            >
              Begin Evaluation Now →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
