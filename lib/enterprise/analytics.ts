// Enterprise Analytics Engine - Phase 2
// Provides advanced analytics data for enterprise dashboards

import { createClient } from '@/utils/supabase/server';

export interface AnalyticsKPIs {
  totalUsers: number;
  activeEnrollments: number;
  completedTrainings: number;
  completionRate: number;
  averageScore: number;
  certificationRate: number;
  pendingCertifications: number;
  expiringSoon: number; // Certs expiring in 30 days
}

export interface TrendDataPoint {
  date: string;
  enrollments: number;
  completions: number;
  averageScore: number;
}

export interface DepartmentStats {
  name: string;
  userCount: number;
  completionRate: number;
  averageScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AnalyticsData {
  kpis: AnalyticsKPIs;
  trends: TrendDataPoint[];
  departments: DepartmentStats[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'enrollment' | 'completion' | 'certificate' | 'expiring';
  user: string;
  description: string;
  timestamp: string;
}

/**
 * Get comprehensive analytics for an organization
 */
export async function getOrganizationAnalytics(orgId: string): Promise<AnalyticsData> {
  const supabase = await createClient();

  // Get KPIs
  const kpis = await getOrganizationKPIs(orgId, supabase);
  
  // Get trend data (last 30 days)
  const trends = await getEnrollmentTrends(orgId, supabase);
  
  // Get department breakdown (using email domains as proxy)
  const departments = await getDepartmentStats(orgId, supabase);
  
  // Get recent activity
  const recentActivity = await getRecentActivity(orgId, supabase);

  return {
    kpis,
    trends,
    departments,
    recentActivity
  };
}

/**
 * Get KPIs for an organization
 */
async function getOrganizationKPIs(orgId: string, supabase: any): Promise<AnalyticsKPIs> {
  // Get all enrollments for the org
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('id, progress_pct, passed, score, created_at')
    .eq('org_id', orgId);

  if (error || !enrollments) {
    return getEmptyKPIs();
  }

  const totalEnrollments = enrollments.length;
  const completedTrainings = enrollments.filter((e: any) => e.passed === true).length;
  const inProgress = enrollments.filter((e: any) => !e.passed && (e.progress_pct || 0) > 0).length;
  
  // Calculate average score from completed enrollments with scores
  const scoresArray = enrollments
    .filter((e: any) => e.score != null)
    .map((e: any) => e.score);
  const averageScore = scoresArray.length > 0 
    ? Math.round(scoresArray.reduce((a: number, b: number) => a + b, 0) / scoresArray.length)
    : 0;

  // Get certificates count
  const { count: certCount } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId);

  // Get expiring certificates (within 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const { count: expiringCount } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .lt('expires_at', thirtyDaysFromNow.toISOString())
    .gt('expires_at', new Date().toISOString());

  const completionRate = totalEnrollments > 0 
    ? Math.round((completedTrainings / totalEnrollments) * 100)
    : 0;

  const certificationRate = completedTrainings > 0
    ? Math.round(((certCount || 0) / completedTrainings) * 100)
    : 0;

  return {
    totalUsers: totalEnrollments, // Using enrollments as proxy for users
    activeEnrollments: inProgress,
    completedTrainings,
    completionRate,
    averageScore,
    certificationRate: Math.min(certificationRate, 100),
    pendingCertifications: Math.max(0, completedTrainings - (certCount || 0)),
    expiringSoon: expiringCount || 0
  };
}

/**
 * Get enrollment trends over time
 */
async function getEnrollmentTrends(orgId: string, supabase: any): Promise<TrendDataPoint[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('created_at, passed, score, updated_at')
    .eq('org_id', orgId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (!enrollments || enrollments.length === 0) {
    return generateEmptyTrends();
  }

  // Group by date
  const dateMap = new Map<string, { enrollments: number; completions: number; scores: number[] }>();
  
  // Initialize last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dateMap.set(dateStr, { enrollments: 0, completions: 0, scores: [] });
  }

  // Populate with data
  enrollments.forEach((e: any) => {
    const createdDate = e.created_at?.split('T')[0];
    if (createdDate && dateMap.has(createdDate)) {
      const entry = dateMap.get(createdDate)!;
      entry.enrollments++;
      if (e.passed) {
        entry.completions++;
        if (e.score != null) {
          entry.scores.push(e.score);
        }
      }
    }
  });

  // Convert to array and sort
  const trends: TrendDataPoint[] = Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      enrollments: data.enrollments,
      completions: data.completions,
      averageScore: data.scores.length > 0 
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return trends;
}

/**
 * Get department statistics (using email domains as proxy)
 */
async function getDepartmentStats(orgId: string, supabase: any): Promise<DepartmentStats[]> {
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      progress_pct,
      passed,
      score,
      user_id,
      profiles:user_id (email)
    `)
    .eq('org_id', orgId);

  if (!enrollments || enrollments.length === 0) {
    return [];
  }

  // Group by email domain (simple department proxy)
  const domainMap = new Map<string, { users: Set<string>; completed: number; total: number; scores: number[] }>();

  enrollments.forEach((e: any) => {
    const email = (e.profiles as any)?.email || '';
    const domain = email.split('@')[1] || 'Unknown';
    
    if (!domainMap.has(domain)) {
      domainMap.set(domain, { users: new Set(), completed: 0, total: 0, scores: [] });
    }
    
    const entry = domainMap.get(domain)!;
    entry.users.add(e.user_id);
    entry.total++;
    
    if (e.passed) {
      entry.completed++;
      if (e.score != null) {
        entry.scores.push(e.score);
      }
    }
  });

  // Convert to array
  const departments: DepartmentStats[] = Array.from(domainMap.entries())
    .map(([domain, data]) => {
      const completionRate = data.total > 0 
        ? Math.round((data.completed / data.total) * 100)
        : 0;
      const averageScore = data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0;

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (completionRate < 50) {
        riskLevel = 'high';
      } else if (completionRate < 80) {
        riskLevel = 'medium';
      }

      return {
        name: domain === 'Unknown' ? 'Unassigned' : domain,
        userCount: data.users.size,
        completionRate,
        averageScore,
        riskLevel
      };
    })
    .sort((a, b) => b.userCount - a.userCount);

  return departments;
}

/**
 * Get recent activity for an organization
 */
async function getRecentActivity(orgId: string, supabase: any): Promise<ActivityItem[]> {
  const activities: ActivityItem[] = [];

  // Get recent enrollments
  const { data: recentEnrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      created_at,
      passed,
      profiles:user_id (email, full_name)
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (recentEnrollments) {
    recentEnrollments.forEach((e: any) => {
      const userName = (e.profiles as any)?.full_name || (e.profiles as any)?.email || 'User';
      
      activities.push({
        id: `enrollment-${e.id}`,
        type: e.passed ? 'completion' : 'enrollment',
        user: userName,
        description: e.passed 
          ? `${userName} completed training`
          : `${userName} started training`,
        timestamp: e.created_at
      });
    });
  }

  // Get recent certificates
  const { data: recentCerts } = await supabase
    .from('certificates')
    .select(`
      id,
      issued_at,
      profiles:user_id (email, full_name)
    `)
    .eq('org_id', orgId)
    .order('issued_at', { ascending: false })
    .limit(5);

  if (recentCerts) {
    recentCerts.forEach((c: any) => {
      const userName = (c.profiles as any)?.full_name || (c.profiles as any)?.email || 'User';
      
      activities.push({
        id: `cert-${c.id}`,
        type: 'certificate',
        user: userName,
        description: `${userName} received certificate`,
        timestamp: c.issued_at
      });
    });
  }

  // Sort by timestamp and return top 15
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);
}

/**
 * Generate empty trends for organizations with no data
 */
function generateEmptyTrends(): TrendDataPoint[] {
  const trends: TrendDataPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    trends.push({
      date: date.toISOString().split('T')[0],
      enrollments: 0,
      completions: 0,
      averageScore: 0
    });
  }
  return trends;
}

/**
 * Return empty KPIs
 */
function getEmptyKPIs(): AnalyticsKPIs {
  return {
    totalUsers: 0,
    activeEnrollments: 0,
    completedTrainings: 0,
    completionRate: 0,
    averageScore: 0,
    certificationRate: 0,
    pendingCertifications: 0,
    expiringSoon: 0
  };
}

/**
 * Get analytics summary for multiple organizations (executive view)
 */
export async function getExecutiveAnalytics(): Promise<{
  totalOrganizations: number;
  totalUsers: number;
  totalCompletions: number;
  overallCompletionRate: number;
  overallAverageScore: number;
}> {
  const supabase = await createClient();

  // Get all organizations
  const { data: orgs } = await supabase
    .from('enrollments')
    .select('org_id')
    .not('org_id', 'is', null);

  const uniqueOrgIds = [...new Set(orgs?.map((o: any) => o.org_id) || [])];

  // Get aggregate stats
  const { data: allEnrollments } = await supabase
    .from('enrollments')
    .select('id, passed, score')
    .not('org_id', 'is', null);

  if (!allEnrollments) {
    return {
      totalOrganizations: 0,
      totalUsers: 0,
      totalCompletions: 0,
      overallCompletionRate: 0,
      overallAverageScore: 0
    };
  }

  const totalCompletions = allEnrollments.filter((e: any) => e.passed).length;
  const scores = allEnrollments
    .filter((e: any) => e.score != null)
    .map((e: any) => e.score);
  
  return {
    totalOrganizations: uniqueOrgIds.length,
    totalUsers: allEnrollments.length,
    totalCompletions,
    overallCompletionRate: allEnrollments.length > 0 
      ? Math.round((totalCompletions / allEnrollments.length) * 100)
      : 0,
    overallAverageScore: scores.length > 0
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : 0
  };
}
