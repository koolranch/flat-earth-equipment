"use server";
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/auth/nextParam';

export async function signInWithPasswordAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const nextRaw = String(formData.get('next') || '/training');
  const next = safeNext(nextRaw) || '/training';

  const supabase = createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  // SMART REDIRECT: Check if user has enterprise role
  if (data.user) {
    const { data: orgMembership } = await supabase
      .from('org_members')
      .select('role, org_id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    // Redirect enterprise users to enterprise dashboard
    // Support both legacy roles (owner, trainer) and new roles (admin, manager, member, viewer)
    if (orgMembership?.role) {
      const enterpriseRoles = ['owner', 'admin', 'manager', 'trainer'];
      
      if (enterpriseRoles.includes(orgMembership.role.toLowerCase())) {
        // If user has specific ?next= param that's enterprise-related, honor it
        if (nextRaw.includes('/enterprise/')) {
          redirect(next);
        }
        // Otherwise, send enterprise users to their dashboard
        redirect('/enterprise/dashboard');
      }
      
      // Members and viewers also get enterprise dashboard (with limited views)
      if (['member', 'learner', 'viewer'].includes(orgMembership.role.toLowerCase())) {
        redirect('/enterprise/dashboard');
      }
    }
  }
  
  // Default: Single-purchase users or no org membership → go to training
  redirect(next);
}
