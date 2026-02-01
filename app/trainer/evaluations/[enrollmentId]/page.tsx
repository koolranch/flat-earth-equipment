import { supabaseServer } from '@/lib/supabase/server';
import EvalForm from '@/components/eval/EvalForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Page({ 
  params, 
  searchParams 
}: { 
  params: { enrollmentId: string };
  searchParams: { back?: string };
}) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return <main className="container mx-auto p-4">Sign in.</main>;
  
  // Check both profiles.role AND org_members.role for enterprise managers
  const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  const { data: orgMember } = await sb.from('org_members').select('role').eq('user_id', user.id).maybeSingle();
  
  const profileRole = prof?.role || '';
  const orgRole = orgMember?.role || '';
  
  // Allow access for: trainer, admin (legacy), OR enterprise managers (owner, trainer/manager role in org_members)
  const hasTrainerAccess = ['trainer', 'admin'].includes(profileRole);
  const hasEnterpriseAccess = ['owner', 'trainer', 'admin', 'manager'].includes(orgRole.toLowerCase());
  
  if (!hasTrainerAccess && !hasEnterpriseAccess) {
    return <main className="container mx-auto p-4">Trainer or Manager access required.</main>;
  }

  const { data: evalRow } = await sb
    .from('employer_evaluations')
    .select('*')
    .eq('enrollment_id', params.enrollmentId)
    .maybeSingle();

  // Determine back URL
  const backUrl = searchParams.back || '/trainer/dashboard';
  const isEnterpriseBack = backUrl.includes('/enterprise');

  return (
    <main className="container mx-auto p-4">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link 
          href={backUrl}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#F76511] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{isEnterpriseBack ? 'Back to Manager Dashboard' : 'Back to Trainer Dashboard'}</span>
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-4">Practical Evaluation</h1>
      <EvalForm enrollmentId={params.enrollmentId} initial={evalRow || null} />
    </main>
  );
}
