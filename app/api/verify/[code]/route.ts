import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Add years to a date string and return ISO string
 * @param dateStr - ISO date string
 * @param years - Number of years to add (default: 3)
 * @returns ISO date string with years added
 */
function addYears(dateStr: string, years = 3): string {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString();
}

/**
 * GET /api/verify/[code]
 * 
 * Public endpoint to verify certificate authenticity and retrieve certificate details.
 * Returns comprehensive certificate information including learner details, course info,
 * validity dates, and practical evaluation status.
 * 
 * @param params - Route parameters containing verification code
 * @returns JSON response with certificate details or error
 */
export async function GET(_: Request, { params }: { params: { code: string } }) {
  const code = (params.code || '').trim();
  
  if (!code) {
    return NextResponse.json(
      { ok: false, error: 'missing_code', message: 'Verification code is required' }, 
      { status: 400 }
    );
  }

  try {
    const svc = supabaseService();
    
    // Fetch certificate by verification code
    const { data: cert, error: certError } = await svc
      .from('certificates')
      .select('id, user_id, enrollment_id, pdf_url, issued_at, verification_code')
      .eq('verification_code', code)
      .maybeSingle();

    if (certError) {
      console.error('Certificate lookup error:', certError);
      return NextResponse.json(
        { ok: false, error: 'database_error', message: 'Failed to verify certificate' },
        { status: 500 }
      );
    }

    if (!cert) {
      return NextResponse.json(
        { ok: false, found: false, message: 'Certificate not found' }, 
        { 
          status: 404,
          headers: { 'Cache-Control': 'no-store' }
        }
      );
    }

    // Fetch related data in parallel for performance
    const [profileResult, enrollmentResult] = await Promise.all([
      svc.from('profiles').select('full_name, email').eq('id', cert.user_id).maybeSingle(),
      svc.from('enrollments').select('course_id').eq('id', cert.enrollment_id).maybeSingle()
    ]);

    const { data: prof, error: profError } = profileResult;
    const { data: enr, error: enrError } = enrollmentResult;

    if (profError) {
      console.error('Profile lookup error:', profError);
    }
    if (enrError) {
      console.error('Enrollment lookup error:', enrError);
    }

    // Fetch course title if enrollment exists
    let courseTitle = 'Training';
    if (enr?.course_id) {
      const { data: course, error: courseError } = await svc
        .from('courses')
        .select('title')
        .eq('id', enr.course_id)
        .maybeSingle();
      
      if (courseError) {
        console.error('Course lookup error:', courseError);
      } else {
        courseTitle = course?.title || courseTitle;
      }
    }

    // Fetch practical evaluation status
    const { data: evalRow, error: evalError } = await svc
      .from('employer_evaluations')
      .select('practical_pass')
      .eq('enrollment_id', cert.enrollment_id)
      .maybeSingle();

    if (evalError) {
      console.error('Evaluation lookup error:', evalError);
    }

    // Calculate expiration date (3 years from issue date)
    const expires_at = cert.issued_at ? addYears(cert.issued_at, 3) : null;
    
    // Check if certificate is expired
    const isExpired = expires_at ? new Date(expires_at) < new Date() : false;

    const response = {
      ok: true,
      found: true,
      code: cert.verification_code,
      learner: {
        name: prof?.full_name || '',
        email: prof?.email || ''
      },
      course_title: courseTitle,
      pdf_url: cert.pdf_url,
      issued_at: cert.issued_at,
      expires_at,
      is_expired: isExpired,
      practical_pass: evalRow?.practical_pass ?? null,
      // Additional metadata for verification purposes
      certificate_id: cert.id,
      verified_at: new Date().toISOString()
    };

    return NextResponse.json(response, {
      headers: { 
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (error) {
    console.error('Certificate verification error:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'server_error', 
        message: 'An error occurred while verifying the certificate' 
      },
      { status: 500 }
    );
  }
}