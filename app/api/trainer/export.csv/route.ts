import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const course_id = url.searchParams.get('course_id') || '';
  
  if (!course_id) {
    return new NextResponse('missing_course_id', { status: 400 });
  }

  try {
    // Authentication check to get user session for the roster API call
    const sb = supabaseServer();
    const { data: { session } } = await sb.auth.getSession();
    
    // Reuse the JSON roster endpoint to avoid duplicating logic
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const rosterUrl = `${baseUrl}/api/trainer/roster?course_id=${encodeURIComponent(course_id)}`;
    
    // Forward the session cookie to maintain authentication
    const cookieHeader = req.headers.get('cookie') || '';
    
    const rosterResponse = await fetch(rosterUrl, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': 'trainer-export-csv'
      },
      cache: 'no-store'
    });

    if (!rosterResponse.ok) {
      return new NextResponse('roster_api_error', { 
        status: rosterResponse.status,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }

    const rosterData = await rosterResponse.json();
    
    if (!rosterData.ok) {
      return new NextResponse(`roster_error: ${rosterData.error}`, { 
        status: 403,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }

    const rows = rosterData.rows as any[];
    
    // CSV header row
    const headers = [
      'name',
      'email', 
      'progress_pct',
      'latest_exam_pct',
      'exam_attempts',
      'cert_verification_code',
      'cert_issued_at',
      'practical_pass',
      'enrollment_id',
      'enrolled_at'
    ];
    
    const csvLines = [headers.join(',')];
    
    // Process each roster row into CSV format
    for (const row of rows) {
      const name = (row.learner?.name || '').replace(/[,\r\n]/g, ' ').trim();
      const email = (row.learner?.email || '').replace(/[,\r\n]/g, ' ').trim();
      const progress = row.progress_pct ?? 0;
      const examScore = row.exam?.latest_score_pct ?? '';
      const examAttempts = row.exam?.total_attempts ?? 0;
      const verificationCode = row.certificate?.verification_code || '';
      const certIssued = row.certificate?.issued_at || '';
      const practicalPass = row.evaluation?.practical_pass === true ? 'true' : 
                           row.evaluation?.practical_pass === false ? 'false' : '';
      const enrollmentId = row.enrollment_id || '';
      const enrolledAt = row.enrolled_at || '';
      
      // Escape values that might contain commas or quotes
      const csvRow = [
        `"${name}"`,
        `"${email}"`,
        progress,
        examScore,
        examAttempts,
        `"${verificationCode}"`,
        `"${certIssued}"`,
        `"${practicalPass}"`,
        `"${enrollmentId}"`,
        `"${enrolledAt}"`
      ];
      
      csvLines.push(csvRow.join(','));
    }
    
    // Add UTF-8 BOM for proper Excel compatibility
    const csvContent = '\uFEFF' + csvLines.join('\n');
    
    // Generate filename with course ID and timestamp
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const filename = `trainer-roster-${course_id.slice(0, 8)}-${timestamp}.csv`;
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('CSV export error:', error);
    return new NextResponse('internal_server_error', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}
