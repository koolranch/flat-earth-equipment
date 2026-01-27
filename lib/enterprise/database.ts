// Enterprise database operations for Phase 1

import { createClient } from '@/utils/supabase/server';
import { 
  Organization, 
  UserOrganization, 
  EnterpriseUser, 
  EnterpriseApiResponse,
  OrganizationStats,
  AuditLog
} from './types';
import { safeJsonParse } from './utils';

/**
 * Get user with enterprise context
 */
export async function getEnterpriseUser(userId: string): Promise<EnterpriseUser | null> {
  const supabase = createClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      organizations:user_organizations(
        id,
        org_id,
        role,
        permissions,
        created_at,
        organization:organizations(*)
      )
    `)
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  // Find primary organization (either org_id or first in list)
  let primary_organization: Organization | undefined;
  if (profile.org_id) {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.org_id)
      .single();
    primary_organization = orgData || undefined;
  } else if (profile.organizations?.length > 0) {
    primary_organization = profile.organizations[0].organization;
  }

  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role,
    org_id: profile.org_id,
    enterprise_settings: safeJsonParse(profile.enterprise_settings, {}),
    last_org_context: profile.last_org_context,
    created_at: profile.created_at,
    organizations: profile.organizations || [],
    primary_organization
  };
}

/**
 * Get organization by ID with stats
 */
export async function getOrganization(orgId: string): Promise<Organization | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      *,
      user_count:user_organizations(count),
      children:organizations!parent_id(*)
    `)
    .eq('id', orgId)
    .single();

  if (error || !data) {
    return null;
  }

  // Get enrollment count for this org
  const { count: enrollmentCount } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .contains('org_context', { org_id: orgId });

  // Calculate completion rate
  const { count: completedCount } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .contains('org_context', { org_id: orgId })
    .eq('passed', true);

  const completion_rate = (enrollmentCount || 0) > 0 ? (completedCount || 0) / (enrollmentCount || 1) * 100 : 0;

  return {
    ...data,
    settings: safeJsonParse(data.settings, {}),
    contact_info: safeJsonParse(data.contact_info, {}),
    user_count: data.user_count?.[0]?.count || 0,
    enrollment_count: enrollmentCount || 0,
    completion_rate: Math.round(completion_rate * 100) / 100,
    children: data.children || []
  };
}

/**
 * Get organizational hierarchy for a user
 */
export async function getOrganizationHierarchy(userId: string): Promise<Organization[]> {
  const supabase = createClient();
  
  // Get all organizations the user has access to
  const { data: userOrgs, error } = await supabase
    .from('user_organizations')
    .select(`
      organization:organizations(*)
    `)
    .eq('user_id', userId);

  if (error || !userOrgs) {
    return [];
  }

  // Cast organization to any since Supabase returns it as object but TS sees it as array
  const orgIds = userOrgs.map(uo => (uo.organization as any)?.id).filter(Boolean);
  
  if (orgIds.length === 0) {
    return [];
  }
  
  // Get full hierarchy including parent/child relationships
  const { data: allOrgs, error: hierarchyError } = await supabase
    .from('organizations')
    .select('*')
    .or(`id.in.(${orgIds.join(',')}),parent_id.in.(${orgIds.join(',')})`);

  if (hierarchyError || !allOrgs) {
    return userOrgs.map(uo => uo.organization as any);
  }

  return allOrgs.map(org => ({
    ...org,
    settings: safeJsonParse(org.settings, {}),
    contact_info: safeJsonParse(org.contact_info, {})
  }));
}

/**
 * Create new organization
 */
export async function createOrganization(
  data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>,
  createdBy: string
): Promise<EnterpriseApiResponse<Organization>> {
  const supabase = createClient();
  
  const { data: newOrg, error } = await supabase
    .from('organizations')
    .insert({
      ...data,
      settings: JSON.stringify(data.settings || {}),
      contact_info: JSON.stringify(data.contact_info || {}),
      created_by: createdBy
    })
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  // Automatically add creator as owner
  await supabase
    .from('user_organizations')
    .insert({
      user_id: createdBy,
      org_id: newOrg.id,
      role: 'owner',
      created_by: createdBy
    });

  // Log the action
  await logAuditEvent({
    org_id: newOrg.id,
    user_id: createdBy,
    action: 'organization_created',
    resource_type: 'organization',
    resource_id: newOrg.id,
    details: { name: newOrg.name, type: newOrg.type }
  });

  return {
    ok: true,
    data: {
      ...newOrg,
      settings: safeJsonParse(newOrg.settings, {}),
      contact_info: safeJsonParse(newOrg.contact_info, {})
    }
  };
}

/**
 * Add user to organization
 */
export async function addUserToOrganization(
  userId: string,
  orgId: string,
  role: UserOrganization['role'] = 'member',
  createdBy: string
): Promise<EnterpriseApiResponse<UserOrganization>> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_organizations')
    .insert({
      user_id: userId,
      org_id: orgId,
      role,
      created_by: createdBy
    })
    .select(`
      *,
      organization:organizations(*),
      user:profiles(id, email, full_name)
    `)
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  // Log the action
  await logAuditEvent({
    org_id: orgId,
    user_id: createdBy,
    action: 'user_added_to_organization',
    resource_type: 'user_organization',
    resource_id: data.id,
    details: { 
      added_user_id: userId, 
      role,
      user_email: data.user?.email 
    }
  });

  return {
    ok: true,
    data: {
      ...data,
      permissions: safeJsonParse(data.permissions, {}),
      organization: {
        ...data.organization,
        settings: safeJsonParse(data.organization?.settings, {}),
        contact_info: safeJsonParse(data.organization?.contact_info, {})
      }
    }
  };
}

/**
 * Get organization stats
 */
export async function getOrganizationStats(orgId: string): Promise<OrganizationStats | null> {
  const supabase = createClient();
  
  // Get user count
  const { count: totalUsers } = await supabase
    .from('user_organizations')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId);

  // Get enrollment stats
  const { count: activeEnrollments } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .contains('org_context', { org_id: orgId })
    .eq('passed', false);

  const { count: completedTrainings } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .contains('org_context', { org_id: orgId })
    .eq('passed', true);

  // Get certificate stats
  const { count: pendingCertifications } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .contains('org_context', { org_id: orgId })
    .is('issued_at', null);

  // Calculate rates
  const totalEnrollments = (activeEnrollments || 0) + (completedTrainings || 0);
  const completionRate = totalEnrollments > 0 ? (completedTrainings || 0) / totalEnrollments * 100 : 0;
  const safeUserCount = totalUsers ?? 0;
  const complianceRate = safeUserCount > 0 ? (completedTrainings || 0) / safeUserCount * 100 : 0;

  // Get average score
  const { data: scoreData } = await supabase
    .from('certificates')
    .select('score')
    .contains('org_context', { org_id: orgId })
    .not('score', 'is', null);

  const averageScore = scoreData && scoreData.length > 0 
    ? scoreData.reduce((sum, cert) => sum + (cert.score || 0), 0) / scoreData.length 
    : 0;

  // TODO: Calculate trends (requires historical data)
  // For now, return mock trends
  const trends = {
    enrollments_trend: 5.2,
    completion_trend: 3.8,
    compliance_trend: 2.1
  };

  return {
    total_users: totalUsers || 0,
    active_enrollments: activeEnrollments || 0,
    completed_trainings: completedTrainings || 0,
    pending_certifications: pendingCertifications || 0,
    compliance_rate: Math.round(complianceRate * 100) / 100,
    completion_rate: Math.round(completionRate * 100) / 100,
    average_score: Math.round(averageScore * 100) / 100,
    trends
  };
}

/**
 * Log audit event
 */
export async function logAuditEvent(event: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
  const supabase = createClient();
  
  await supabase
    .from('audit_logs')
    .insert({
      ...event,
      details: JSON.stringify(event.details || {})
    });
}

/**
 * Get audit logs for organization
 */
export async function getAuditLogs(
  orgId: string,
  options: {
    limit?: number;
    offset?: number;
    userId?: string;
    action?: string;
    from?: string;
    to?: string;
  } = {}
): Promise<{ logs: AuditLog[]; total: number }> {
  const supabase = createClient();
  
  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      user:profiles(email, full_name)
    `, { count: 'exact' })
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (options.userId) {
    query = query.eq('user_id', options.userId);
  }

  if (options.action) {
    query = query.eq('action', options.action);
  }

  if (options.from) {
    query = query.gte('created_at', options.from);
  }

  if (options.to) {
    query = query.lte('created_at', options.to);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    logs: (data || []).map(log => ({
      ...log,
      details: safeJsonParse(log.details, {})
    })),
    total: count || 0
  };
}

/**
 * Update user's enterprise settings
 */
export async function updateUserEnterpriseSettings(
  userId: string,
  settings: Record<string, any>
): Promise<EnterpriseApiResponse<void>> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({
      enterprise_settings: JSON.stringify(settings)
    })
    .eq('id', userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/**
 * Switch user's organization context
 */
export async function switchOrganizationContext(
  userId: string,
  orgId: string
): Promise<EnterpriseApiResponse<void>> {
  const supabase = createClient();
  
  // Verify user has access to this organization
  const { data: access, error: accessError } = await supabase
    .from('user_organizations')
    .select('id')
    .eq('user_id', userId)
    .eq('org_id', orgId)
    .single();

  if (accessError || !access) {
    return { ok: false, error: 'Access denied to organization' };
  }

  // Update user's context
  const { error } = await supabase
    .from('profiles')
    .update({
      last_org_context: orgId
    })
    .eq('id', userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}