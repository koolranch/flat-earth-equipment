import { NextResponse } from 'next/server';
import { requireAdminServer } from '@/lib/admin/guard';
import { supabaseService } from '@/lib/supabase/service.server';
import { logAdminAction } from '@/lib/admin/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * CSV Export endpoint for admin roster data
 * Protected by admin authentication and optional token
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Verify admin access
    const adminCheck = await requireAdminServer();
    if (!adminCheck.ok) {
      return NextResponse.json(
        { 
          error: adminCheck.reason === 'unauthorized' ? 'Authentication required' : 'Admin access required',
          reason: adminCheck.reason 
        }, 
        { status: adminCheck.reason === 'unauthorized' ? 401 : 403 }
      );
    }

    // Optional token verification for additional security
    if (process.env.ADMIN_EXPORT_TOKEN && token !== process.env.ADMIN_EXPORT_TOKEN) {
      return NextResponse.json(
        { error: 'Invalid export token' }, 
        { status: 403 }
      );
    }

    const sb = supabaseService();

    // Fetch enrollments with all related data
    let roster: any[] = [];
    try {
      const { data: enrs } = await sb
        .from('enrollments')
        .select('id, user_id, course_id, progress_pct, passed, created_at, profiles:profiles(full_name, email)')
        .order('created_at', { ascending: false });
      roster = enrs || [];
    } catch {
      const { data: enrs } = await sb
        .from('enrollments')
        .select('id, user_id, course_id, progress_pct, passed, created_at')
        .order('created_at', { ascending: false });
      roster = enrs || [];
    }

    // Fetch exam attempts
    let attemptsByUser = new Map<string, any>();
    try {
      const { data: atts } = await sb
        .from('exam_attempts')
        .select('user_id, score_pct, passed, created_at')
        .order('created_at', { ascending: false });
      for (const a of atts || []) {
        if (!attemptsByUser.has(a.user_id)) {
          attemptsByUser.set(a.user_id, a);
        }
      }
    } catch {}

    // Fetch practical evaluations
    let evalByEnrollment = new Map<string, any>();
    try {
      const { data: evals } = await sb
        .from('employer_evaluations')
        .select('enrollment_id, practical_pass, evaluation_date, evaluator_name')
        .order('evaluation_date', { ascending: false });
      for (const e of evals || []) {
        if (!evalByEnrollment.has(e.enrollment_id)) {
          evalByEnrollment.set(e.enrollment_id, e);
        }
      }
    } catch {}

    // Fetch certificates
    let certByEnrollment = new Map<string, any>();
    try {
      const { data: certs } = await sb
        .from('certificates')
        .select('enrollment_id, pdf_url, issued_at')
        .order('issued_at', { ascending: false });
      for (const c of certs || []) {
        if (!certByEnrollment.has(c.enrollment_id)) {
          certByEnrollment.set(c.enrollment_id, c);
        }
      }
    } catch {}

    // Build CSV data
    const csvRows = roster.map(r => {
      const att = attemptsByUser.get(r.user_id);
      const pe = evalByEnrollment.get(r.id);
      const cert = certByEnrollment.get(r.id);
      
      return {
        enrollment_id: r.id,
        course_id: r.course_id || '',
        user_id: r.user_id,
        full_name: r.profiles?.full_name || '',
        email: r.profiles?.email || '',
        progress_pct: r.progress_pct ?? 0,
        passed: r.passed ? 'Yes' : 'No',
        last_exam_score: att?.score_pct ?? '',
        exam_passed: att?.passed ? 'Yes' : (att?.passed === false ? 'No' : ''),
        practical_pass: pe?.practical_pass === true ? 'Yes' : (pe?.practical_pass === false ? 'No' : ''),
        evaluation_date: pe?.evaluation_date || '',
        evaluator_name: pe?.evaluator_name || '',
        certificate_issued: cert?.pdf_url ? 'Yes' : 'No',
        certificate_date: cert?.issued_at || '',
        enrollment_created: r.created_at
      };
    });

    // Convert to CSV format
    const headers = [
      'enrollment_id',
      'course_id', 
      'user_id',
      'full_name',
      'email',
      'progress_pct',
      'passed',
      'last_exam_score',
      'exam_passed',
      'practical_pass',
      'evaluation_date',
      'evaluator_name',
      'certificate_issued',
      'certificate_date',
      'enrollment_created'
    ];

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escape commas and quotes in CSV values
          const stringValue = String(value || '');
          return stringValue.includes(',') || stringValue.includes('"') 
            ? `"${stringValue.replace(/"/g, '""')}"` 
            : stringValue;
        }).join(',')
      )
    ].join('\n');

    // Log admin action
    await logAdminAction('roster_export', adminCheck.user, { 
      record_count: csvRows.length,
      export_timestamp: new Date().toISOString()
    });

    // Return CSV file
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="roster-export-${new Date().toISOString().split('T')[0]}.csv"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Roster export error:', error);
    return NextResponse.json(
      { error: 'Export failed' }, 
      { status: 500 }
    );
  }
}
