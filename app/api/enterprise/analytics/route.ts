// Enterprise Analytics API - Phase 2
// Provides analytics data for enterprise dashboards

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { 
  getOrganizationAnalytics, 
  getExecutiveAnalytics 
} from '@/lib/enterprise/analytics';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get org_id from query params or user profile
    const searchParams = request.nextUrl.searchParams;
    const orgIdParam = searchParams.get('org_id');
    const viewType = searchParams.get('view') || 'organization'; // organization | executive

    // If executive view requested, return aggregate data
    if (viewType === 'executive') {
      const executiveData = await getExecutiveAnalytics();
      return NextResponse.json({
        ok: true,
        type: 'executive',
        data: executiveData
      });
    }

    // Get user's org_id if not provided
    let orgId = orgIdParam;
    
    if (!orgId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();
      
      orgId = profile?.org_id;
    }

    // If still no org_id, try to find from enrollments
    if (!orgId) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('org_id')
        .eq('user_id', user.id)
        .not('org_id', 'is', null)
        .limit(1)
        .single();
      
      orgId = enrollment?.org_id;
    }

    if (!orgId) {
      return NextResponse.json({
        ok: true,
        type: 'organization',
        data: null,
        message: 'No organization found for this user'
      });
    }

    // Get full analytics for the organization
    const analytics = await getOrganizationAnalytics(orgId);

    return NextResponse.json({
      ok: true,
      type: 'organization',
      org_id: orgId,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// POST endpoint for exporting analytics data
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { org_id, format = 'csv', dateRange } = body;

    if (!org_id) {
      return NextResponse.json(
        { error: 'org_id is required' },
        { status: 400 }
      );
    }

    // Get analytics data
    const analytics = await getOrganizationAnalytics(org_id);

    // Format based on requested type
    if (format === 'csv') {
      const csvData = generateCSVExport(analytics);
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // JSON export
    return NextResponse.json({
      ok: true,
      exported_at: new Date().toISOString(),
      org_id,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics export error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to export analytics' },
      { status: 500 }
    );
  }
}

/**
 * Generate CSV export from analytics data
 */
function generateCSVExport(analytics: any): string {
  const lines: string[] = [];
  
  // KPIs Section
  lines.push('=== ANALYTICS REPORT ===');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('=== KEY PERFORMANCE INDICATORS ===');
  lines.push('Metric,Value');
  lines.push(`Total Users,${analytics.kpis.totalUsers}`);
  lines.push(`Active Enrollments,${analytics.kpis.activeEnrollments}`);
  lines.push(`Completed Trainings,${analytics.kpis.completedTrainings}`);
  lines.push(`Completion Rate,${analytics.kpis.completionRate}%`);
  lines.push(`Average Score,${analytics.kpis.averageScore}%`);
  lines.push(`Certification Rate,${analytics.kpis.certificationRate}%`);
  lines.push(`Pending Certifications,${analytics.kpis.pendingCertifications}`);
  lines.push(`Expiring Soon (30 days),${analytics.kpis.expiringSoon}`);
  lines.push('');

  // Trends Section
  lines.push('=== ENROLLMENT TRENDS (Last 30 Days) ===');
  lines.push('Date,Enrollments,Completions,Average Score');
  analytics.trends.forEach((t: any) => {
    lines.push(`${t.date},${t.enrollments},${t.completions},${t.averageScore}`);
  });
  lines.push('');

  // Departments Section
  if (analytics.departments.length > 0) {
    lines.push('=== DEPARTMENT BREAKDOWN ===');
    lines.push('Department,Users,Completion Rate,Average Score,Risk Level');
    analytics.departments.forEach((d: any) => {
      lines.push(`${d.name},${d.userCount},${d.completionRate}%,${d.averageScore}%,${d.riskLevel}`);
    });
    lines.push('');
  }

  // Recent Activity Section
  if (analytics.recentActivity.length > 0) {
    lines.push('=== RECENT ACTIVITY ===');
    lines.push('Timestamp,Type,User,Description');
    analytics.recentActivity.forEach((a: any) => {
      lines.push(`${a.timestamp},${a.type},"${a.user}","${a.description}"`);
    });
  }

  return lines.join('\n');
}
