import 'server-only';
import { supabaseService } from '@/lib/supabase/service.server';

export async function createOrGetUserByEmail(email: string, password?: string) {
  const sb = supabaseService();
  
  // Try to create new user
  const { data: created, error } = await sb.auth.admin.createUser({
    email,
    password: password || undefined,
    email_confirm: true
  });
  
  if (!error && created?.user) {
    console.log(`[TEST-ACCOUNTS] Created new user: ${email}`);
    return created.user;
  }

  // If already exists, try to find via listUsers (simple scan; for small QA it's fine)
  const { data: list } = await sb.auth.admin.listUsers();
  const existing = list?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
  
  if (existing) {
    console.log(`[TEST-ACCOUNTS] Found existing user: ${email}`);
    return existing;
  }
  
  throw new Error(error?.message || 'Unable to create or locate user');
}

export async function ensureOrgMembership(orgId: string, userId: string, role: 'owner' | 'trainer' | 'learner' = 'learner') {
  const sb = supabaseService();
  
  // Check if membership already exists
  const { data: exists } = await sb
    .from('org_members')
    .select('id, role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (!exists) {
    // Create new membership
    const { error } = await sb
      .from('org_members')
      .insert({ 
        org_id: orgId, 
        user_id: userId, 
        role 
      });
    
    if (error) throw error;
    console.log(`[TEST-ACCOUNTS] Added user ${userId} to org ${orgId} as ${role}`);
  } else {
    // Update role if different
    if (exists.role !== role) {
      const { error } = await sb
        .from('org_members')
        .update({ role })
        .eq('org_id', orgId)
        .eq('user_id', userId);
      
      if (error) throw error;
      console.log(`[TEST-ACCOUNTS] Updated user ${userId} role from ${exists.role} to ${role}`);
    } else {
      console.log(`[TEST-ACCOUNTS] User ${userId} already in org ${orgId} as ${role}`);
    }
  }
}

export async function ensureEnrollment(orgId: string, userId: string, courseId: string, learnerEmail?: string | null) {
  const sb = supabaseService();
  
  // Check for existing enrollment
  const { data: existing } = await sb
    .from('enrollments')
    .select('id, org_id, learner_email')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();
  
  if (existing?.id) {
    // Update existing enrollment with org and email if needed
    const updates: any = {};
    if (existing.org_id !== orgId) updates.org_id = orgId;
    if (existing.learner_email !== learnerEmail) updates.learner_email = learnerEmail || null;
    
    if (Object.keys(updates).length > 0) {
      const { error } = await sb
        .from('enrollments')
        .update(updates)
        .eq('id', existing.id);
      
      if (error) throw error;
      console.log(`[TEST-ACCOUNTS] Updated enrollment ${existing.id} with org ${orgId}`);
    } else {
      console.log(`[TEST-ACCOUNTS] Enrollment ${existing.id} already up to date`);
    }
    
    return existing.id;
  } else {
    // Create new enrollment
    const { data, error } = await sb
      .from('enrollments')
      .insert({ 
        user_id: userId, 
        course_id: courseId, 
        org_id: orgId, 
        learner_email: learnerEmail || null, 
        passed: false, 
        progress_pct: 0 
      })
      .select('id')
      .single();
    
    if (error) throw error;
    console.log(`[TEST-ACCOUNTS] Created enrollment ${data.id} for user ${userId} in course ${courseId}`);
    return data.id as string;
  }
}

export async function createMagicLink(email: string, redirectTo?: string) {
  const sb = supabaseService();
  
  const defaultRedirect = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const finalRedirectTo = redirectTo || defaultRedirect;
  
  const { data, error } = await sb.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { 
      redirectTo: finalRedirectTo 
    }
  });
  
  if (error) throw error;
  
  console.log(`[TEST-ACCOUNTS] Generated magic link for ${email}, redirects to ${finalRedirectTo}`);
  
  // `data.action_link` opens GoTrue and then redirects with tokens to redirectTo;
  // your client is already set with detectSessionInUrl: true, so session will be picked up.
  return data.action_link;
}

// Helper to validate org exists
export async function validateOrg(orgId: string) {
  const sb = supabaseService();
  
  const { data: org } = await sb
    .from('organizations')
    .select('id, name')
    .eq('id', orgId)
    .maybeSingle();
  
  if (!org) {
    throw new Error(`Organization ${orgId} not found`);
  }
  
  return org;
}

// Helper to validate course exists
export async function validateCourse(courseId: string) {
  const sb = supabaseService();
  
  const { data: course } = await sb
    .from('courses')
    .select('id, title')
    .eq('id', courseId)
    .maybeSingle();
  
  if (!course) {
    throw new Error(`Course ${courseId} not found`);
  }
  
  return course;
}
