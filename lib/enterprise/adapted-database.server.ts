// Adapted Enterprise Database Operations - Working with Existing Schema
// Phase 1 Alternative Approach

import { supabaseService } from '@/lib/supabase/service.server';
import { EnterpriseUser, OrganizationStats, EnterpriseApiResponse } from './types';

/**
 * Adapted organization structure using existing schema
 */
export interface AdaptedOrganization {
  id: string;
  name: string;
  type: 'facility' | 'department' | 'team';
  parent_id?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  
  // Computed from enrollments
  user_count?: number;
  enrollment_count?: number;
  completion_rate?: number;
}

/**
 * Get enterprise user using existing schema
 */
export async function getAdaptedEnterpriseUser(userId: string): Promise<EnterpriseUser | null> {
  const supabase = supabaseService();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  // Check if user is associated with any organizations via enrollments
  const { data: orgEnrollments } = await supabase
    .from('enrollments')
    .select('org_id')
    .eq('user_id', userId)
    .not('org_id', 'is', null)
    .limit(1);

  const isEnterpriseUser = orgEnrollments && orgEnrollments.length > 0;

  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role,
    org_id: orgEnrollments?.[0]?.org_id || null,
    enterprise_settings: {
      preferred_dashboard: isEnterpriseUser ? 'enterprise' : 'trainer'
    },
    created_at: profile.created_at,
    organizations: [] // Will populate with adapted org relationships
  };
}

/**
 * Get organization hierarchy from enrollments data
 */
export async function getAdaptedOrganizations(): Promise<AdaptedOrganization[]> {
  const supabase = supabaseService();
  
  // Get unique org_ids from enrollments with stats
  const { data: orgData } = await supabase
    .from('enrollments')
    .select(`
      org_id,
      user_id,
      passed,
      learner_email
    `)
    .not('org_id', 'is', null);

  if (!orgData) return [];

  // Group by org_id and calculate stats
  const orgMap = new Map<string, {
    id: string;
    users: Set<string>;
    enrollments: number;
    completed: number;
    emails: Set<string>;
  }>();

  orgData.forEach(enrollment => {
    const orgId = enrollment.org_id;
    if (!orgMap.has(orgId)) {
      orgMap.set(orgId, {
        id: orgId,
        users: new Set(),
        enrollments: 0,
        completed: 0,
        emails: new Set()
      });
    }
    
    const org = orgMap.get(orgId)!;
    org.users.add(enrollment.user_id);
    org.enrollments++;
    if (enrollment.passed) org.completed++;
    if (enrollment.learner_email) org.emails.add(enrollment.learner_email);
  });

  // Convert to AdaptedOrganization format
  const organizations: AdaptedOrganization[] = [];
  
  orgMap.forEach((stats, orgId) => {
    // Try to derive organization name from org_id or use a default
    let orgName = `Organization ${orgId.substring(0, 8)}`;
    
    // If org_id looks like a UUID, try to make a more friendly name
    if (orgId.length === 36) {
      // Use first email domain or generic name
      const firstEmail = Array.from(stats.emails)[0];
      if (firstEmail) {
        const domain = firstEmail.split('@')[1];
        orgName = domain ? `${domain.split('.')[0]} Organization` : orgName;
      }
    }

    organizations.push({
      id: orgId,
      name: orgName,
      type: 'facility', // Default to facility for now
      created_at: new Date().toISOString(),
      user_count: stats.users.size,
      enrollment_count: stats.enrollments,
      completion_rate: stats.enrollments > 0 
        ? Math.round((stats.completed / stats.enrollments) * 100) 
        : 0
    });
  });

  return organizations.sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0));
}

/**
 * Get organization stats using existing data
 */
export async function getAdaptedOrganizationStats(orgId: string): Promise<OrganizationStats | null> {
  const supabase = supabaseService();
  
  // Get all enrollments for this organization
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('user_id, passed, created_at')
    .eq('org_id', orgId);

  if (!enrollments) return null;

  const uniqueUsers = new Set(enrollments.map(e => e.user_id)).size;
  const totalEnrollments = enrollments.length;
  const completedTrainings = enrollments.filter(e => e.passed).length;
  const activeEnrollments = enrollments.filter(e => !e.passed).length;

  // Get certificates for this org
  const { data: certificates } = await supabase
    .from('certificates')
    .select('score, created_at, user_id')
    .in('user_id', enrollments.map(e => e.user_id));

  const certificatesInOrg = certificates || [];
  const averageScore = certificatesInOrg.length > 0
    ? certificatesInOrg.reduce((sum, cert) => sum + (cert.score || 0), 0) / certificatesInOrg.length
    : 0;

  // Calculate rates
  const completionRate = totalEnrollments > 0 ? (completedTrainings / totalEnrollments) * 100 : 0;
  const complianceRate = uniqueUsers > 0 ? (completedTrainings / uniqueUsers) * 100 : 0;

  // Simple trend calculation (mock for now)
  const trends = {
    enrollments_trend: 5.2,
    completion_trend: 3.8,
    compliance_trend: 2.1
  };

  return {
    total_users: uniqueUsers,
    active_enrollments: activeEnrollments,
    completed_trainings: completedTrainings,
    pending_certifications: 0, // Would need more complex query
    compliance_rate: Math.round(complianceRate * 100) / 100,
    completion_rate: Math.round(completionRate * 100) / 100,
    average_score: Math.round(averageScore * 100) / 100,
    trends
  };
}

/**
 * Get users in an organization
 */
export async function getOrganizationUsers(orgId: string, options: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'all' | 'active' | 'completed';
} = {}): Promise<{ users: any[]; total: number }> {
  const supabase = supabaseService();
  
  const page = options.page || 1;
  const pageSize = options.pageSize || 50;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('enrollments')
    .select(`
      user_id,
      learner_email,
      progress_pct,
      passed,
      created_at,
      updated_at,
      course_id,
      courses(title, slug)
    `, { count: 'exact' })
    .eq('org_id', orgId);

  // Apply filters
  if (options.search) {
    query = query.ilike('learner_email', `%${options.search}%`);
  }

  if (options.status === 'active') {
    query = query.eq('passed', false);
  } else if (options.status === 'completed') {
    query = query.eq('passed', true);
  }

  // Pagination
  query = query
    .range(offset, offset + pageSize - 1)
    .order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // Transform data to user format
  const users = (data || []).map(enrollment => ({
    id: enrollment.user_id,
    email: enrollment.learner_email,
    full_name: enrollment.learner_email?.split('@')[0] || 'Unknown',
    course: (enrollment.courses as any)?.title || 'Unknown Course',
    course_slug: (enrollment.courses as any)?.slug,
    progress_pct: enrollment.progress_pct || 0,
    score: null, // Score not stored in enrollments table - would need certificates join
    status: enrollment.passed ? 'completed' : 'active',
    enrollment_date: enrollment.created_at,
    last_activity: enrollment.updated_at
  }));

  return {
    users,
    total: count || 0
  };
}

/**
 * Assign training to organization users (bulk operation)
 */
export async function bulkAssignTraining(
  orgId: string,
  courseId: string,
  userEmails: string[],
  assignedBy: string
): Promise<EnterpriseApiResponse<{ created: number; errors: string[] }>> {
  const supabase = supabaseService();
  
  const results = { created: 0, errors: [] as string[] };
  
  for (const email of userEmails) {
    try {
      // Check if enrollment already exists
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('learner_email', email)
        .eq('course_id', courseId)
        .single();

      if (existing) {
        results.errors.push(`${email}: Already enrolled`);
        continue;
      }

      // Create new enrollment
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
          learner_email: email,
          course_id: courseId,
          org_id: orgId,
          progress_pct: 0,
          passed: false
        });

      if (error) {
        results.errors.push(`${email}: ${error.message}`);
      } else {
        results.created++;
      }
    } catch (err) {
      results.errors.push(`${email}: Unexpected error`);
    }
  }

  return {
    ok: true,
    data: results
  };
}

/**
 * Log audit event using existing audit_logs table
 */
export async function logAdaptedAuditEvent(event: {
  org_id?: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
}): Promise<void> {
  const supabase = supabaseService();
  
  await supabase
    .from('audit_logs')
    .insert({
      org_id: event.org_id,
      user_id: event.user_id,
      action: event.action,
      resource_type: event.resource_type,
      resource_id: event.resource_id,
      details: JSON.stringify(event.details)
    });
}

/**
 * Export organization data
 */
export async function exportOrganizationData(orgId: string): Promise<{
  organization: AdaptedOrganization;
  users: any[];
  enrollments: any[];
  certificates: any[];
}> {
  const supabase = supabaseService();
  
  // Get organization info
  const organizations = await getAdaptedOrganizations();
  const organization = organizations.find(org => org.id === orgId);
  
  if (!organization) {
    throw new Error('Organization not found');
  }

  // Get users and enrollments
  const { users } = await getOrganizationUsers(orgId, { pageSize: 1000 });
  
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      courses(title, slug)
    `)
    .eq('org_id', orgId);

  const { data: certificates } = await supabase
    .from('certificates')
    .select('*')
    .in('user_id', users.map(u => u.id));

  return {
    organization,
    users,
    enrollments: enrollments || [],
    certificates: certificates || []
  };
}