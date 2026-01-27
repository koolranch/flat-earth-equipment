// Enterprise Bulk Operations API - Phase 2
// Handles CSV import/export for users and training assignments

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  parseCSV,
  generateCSV,
  validateUserRecord,
  validateAssignmentRecord,
  getUserImportTemplate,
  getAssignmentTemplate,
  exportUsersToCSV,
  exportEnrollmentsToCSV,
  CSVUserRecord,
  CSVAssignmentRecord,
  BulkOperationResult
} from '@/lib/enterprise/bulk-operations';
import { normalizeRole, getRolePermissions, hasPermission } from '@/lib/enterprise/rbac';

/**
 * GET - Export data or get templates
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action'); // template | export
    const type = searchParams.get('type'); // users | assignments | enrollments
    const orgId = searchParams.get('org_id');

    // Check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = normalizeRole(profile?.role || 'member');
    const permissions = getRolePermissions(userRole);

    if (!hasPermission(permissions, 'reports:export')) {
      return NextResponse.json({ ok: false, error: 'Export permission required' }, { status: 403 });
    }

    // Return templates
    if (action === 'template') {
      let csvContent = '';
      let filename = '';

      if (type === 'users') {
        csvContent = getUserImportTemplate();
        filename = 'user-import-template.csv';
      } else if (type === 'assignments') {
        csvContent = getAssignmentTemplate();
        filename = 'training-assignment-template.csv';
      } else {
        return NextResponse.json({ ok: false, error: 'Invalid template type' }, { status: 400 });
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    // Export data
    if (action === 'export') {
      if (!orgId) {
        return NextResponse.json({ ok: false, error: 'org_id is required for export' }, { status: 400 });
      }

      if (type === 'users') {
        // Export organization users
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select(`
            user_id,
            progress_pct,
            passed,
            profiles:user_id (email, full_name, role)
          `)
          .eq('org_id', orgId);

        if (!enrollments) {
          return NextResponse.json({ ok: false, error: 'No users found' }, { status: 404 });
        }

        // Aggregate user data
        const userMap = new Map<string, any>();
        enrollments.forEach((e: any) => {
          const userId = e.user_id;
          const profile = e.profiles as any;
          
          if (!userMap.has(userId)) {
            userMap.set(userId, {
              email: profile?.email || '',
              full_name: profile?.full_name || '',
              role: profile?.role || 'member',
              department: '',
              enrollment_count: 0,
              completion_rate: 0,
              completed: 0
            });
          }
          
          const userData = userMap.get(userId);
          userData.enrollment_count++;
          if (e.passed) userData.completed++;
        });

        // Calculate completion rates
        const users = Array.from(userMap.values()).map(u => ({
          ...u,
          completion_rate: u.enrollment_count > 0 
            ? Math.round((u.completed / u.enrollment_count) * 100) 
            : 0
        }));

        const csvContent = exportUsersToCSV(users);
        
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`
          }
        });
      }

      if (type === 'enrollments') {
        // Export all enrollments
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select(`
            user_id,
            progress_pct,
            passed,
            score,
            created_at,
            updated_at,
            profiles:user_id (email, full_name),
            courses:course_id (title)
          `)
          .eq('org_id', orgId);

        if (!enrollments) {
          return NextResponse.json({ ok: false, error: 'No enrollments found' }, { status: 404 });
        }

        const exportData = enrollments.map((e: any) => ({
          user_email: (e.profiles as any)?.email || '',
          user_name: (e.profiles as any)?.full_name || '',
          course_name: (e.courses as any)?.title || '',
          progress_pct: e.progress_pct || 0,
          passed: !!e.passed,
          score: e.score ?? undefined,
          enrolled_at: e.created_at?.split('T')[0] || '',
          completed_at: e.passed ? e.updated_at?.split('T')[0] : undefined
        }));

        const csvContent = exportEnrollmentsToCSV(exportData);
        
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="enrollments-export-${new Date().toISOString().split('T')[0]}.csv"`
          }
        });
      }

      return NextResponse.json({ ok: false, error: 'Invalid export type' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Bulk export error:', error);
    return NextResponse.json({ ok: false, error: 'Export failed' }, { status: 500 });
  }
}

/**
 * POST - Import data (users or training assignments)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = normalizeRole(profile?.role || 'member');
    const permissions = getRolePermissions(userRole);

    if (!hasPermission(permissions, 'users:bulk_operations')) {
      return NextResponse.json({ ok: false, error: 'Bulk operations permission required' }, { status: 403 });
    }

    const body = await request.json();
    const { type, csv_content, org_id, dry_run = false } = body;

    if (!type || !csv_content || !org_id) {
      return NextResponse.json(
        { ok: false, error: 'type, csv_content, and org_id are required' },
        { status: 400 }
      );
    }

    if (type === 'users') {
      return await importUsers(supabase, csv_content, org_id, dry_run, user.id);
    }

    if (type === 'assignments') {
      return await importAssignments(supabase, csv_content, org_id, dry_run, user.id);
    }

    return NextResponse.json({ ok: false, error: 'Invalid import type' }, { status: 400 });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ ok: false, error: 'Import failed' }, { status: 500 });
  }
}

/**
 * Import users from CSV
 */
async function importUsers(
  supabase: any,
  csvContent: string,
  orgId: string,
  dryRun: boolean,
  importedBy: string
): Promise<NextResponse> {
  const { data: records, errors: parseErrors } = parseCSV<CSVUserRecord>(
    csvContent,
    ['email', 'full_name']
  );

  if (parseErrors.length > 0) {
    return NextResponse.json({
      ok: false,
      error: 'CSV parsing failed',
      details: parseErrors
    }, { status: 400 });
  }

  const result: BulkOperationResult = {
    success: true,
    total: records.length,
    processed: 0,
    failed: 0,
    errors: [],
    created: 0,
    updated: 0,
    skipped: 0
  };

  // Validate all records first
  for (let i = 0; i < records.length; i++) {
    const validation = validateUserRecord(records[i], i + 2); // +2 for header and 1-based
    if (!validation.valid) {
      result.errors.push(...validation.errors);
      result.failed++;
    }
  }

  // If dry run or has errors, return validation results
  if (dryRun || result.errors.length > 0) {
    result.success = result.errors.length === 0;
    return NextResponse.json({
      ok: true,
      dry_run: dryRun,
      result
    });
  }

  // Process valid records
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', record.email.toLowerCase())
        .single();

      if (existingUser) {
        // Update existing user
        await supabase
          .from('profiles')
          .update({
            full_name: record.full_name,
            role: record.role ? normalizeRole(record.role) : undefined,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id);

        result.updated = (result.updated || 0) + 1;
      } else {
        // For new users, we'd typically send invites
        // For now, just track as skipped (needs invite flow)
        result.skipped = (result.skipped || 0) + 1;
        result.errors.push({
          row: i + 2,
          message: `User ${record.email} not found. Use invite flow to add new users.`
        });
      }

      result.processed++;
    } catch (err) {
      result.failed++;
      result.errors.push({
        row: i + 2,
        message: `Failed to process: ${(err as Error).message}`
      });
    }
  }

  result.success = result.failed === 0;

  return NextResponse.json({ ok: true, result });
}

/**
 * Import training assignments from CSV
 */
async function importAssignments(
  supabase: any,
  csvContent: string,
  orgId: string,
  dryRun: boolean,
  assignedBy: string
): Promise<NextResponse> {
  const { data: records, errors: parseErrors } = parseCSV<CSVAssignmentRecord>(
    csvContent,
    ['email', 'course_slug']
  );

  if (parseErrors.length > 0) {
    return NextResponse.json({
      ok: false,
      error: 'CSV parsing failed',
      details: parseErrors
    }, { status: 400 });
  }

  // Get valid courses
  const { data: courses } = await supabase
    .from('courses')
    .select('slug');
  
  const validCourses = courses?.map((c: any) => c.slug) || [];

  const result: BulkOperationResult = {
    success: true,
    total: records.length,
    processed: 0,
    failed: 0,
    errors: [],
    created: 0,
    skipped: 0
  };

  // Validate all records
  for (let i = 0; i < records.length; i++) {
    const validation = validateAssignmentRecord(records[i], i + 2, validCourses);
    if (!validation.valid) {
      result.errors.push(...validation.errors);
      result.failed++;
    }
  }

  if (dryRun || result.errors.length > 0) {
    result.success = result.errors.length === 0;
    return NextResponse.json({
      ok: true,
      dry_run: dryRun,
      result
    });
  }

  // Process valid records
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    
    try {
      // Find user by email
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', record.email.toLowerCase())
        .single();

      if (!userProfile) {
        result.skipped = (result.skipped || 0) + 1;
        result.errors.push({
          row: i + 2,
          field: 'email',
          message: `User not found: ${record.email}`
        });
        continue;
      }

      // Find course by slug
      const { data: course } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', record.course_slug)
        .single();

      if (!course) {
        result.skipped = (result.skipped || 0) + 1;
        result.errors.push({
          row: i + 2,
          field: 'course_slug',
          message: `Course not found: ${record.course_slug}`
        });
        continue;
      }

      // Check for existing enrollment
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', userProfile.id)
        .eq('course_id', course.id)
        .single();

      if (existing) {
        result.skipped = (result.skipped || 0) + 1;
        continue; // Already enrolled
      }

      // Create enrollment
      await supabase
        .from('enrollments')
        .insert({
          user_id: userProfile.id,
          course_id: course.id,
          org_id: orgId,
          progress_pct: 0,
          passed: false,
          assigned_by: assignedBy,
          created_at: new Date().toISOString()
        });

      result.created = (result.created || 0) + 1;
      result.processed++;
    } catch (err) {
      result.failed++;
      result.errors.push({
        row: i + 2,
        message: `Failed to process: ${(err as Error).message}`
      });
    }
  }

  result.success = result.failed === 0;

  return NextResponse.json({ ok: true, result });
}
