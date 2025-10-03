import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const sb = supabaseServer();
    const { data: { user }, error: userError } = await sb.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        user_error: userError?.message 
      }, { status: 401 });
    }

    const svc = supabaseService();

    // Check enrollment
    const { data: enrollment, error: enrError } = await svc
      .from('enrollments')
      .select('id, user_id, course_id, passed, progress_pct, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('[debug/check-cert] Enrollment:', enrollment);
    console.log('[debug/check-cert] Enrollment error:', enrError);

    // Check certificate
    let cert = null;
    let certError = null;
    if (enrollment) {
      const result = await svc
        .from('certificates')
        .select('*')
        .eq('enrollment_id', enrollment.id)
        .maybeSingle();
      cert = result.data;
      certError = result.error;
      
      console.log('[debug/check-cert] Certificate:', cert);
      console.log('[debug/check-cert] Certificate error:', certError);
    }

    // Check exam attempts
    const { data: attempts, error: attemptsError } = await svc
      .from('exam_attempts')
      .select('id, exam_slug, score_pct, passed, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      enrollment: enrollment || 'No enrollment found',
      enrollment_error: enrError?.message || null,
      certificate: cert || 'No certificate found',
      certificate_error: certError?.message || null,
      recent_exam_attempts: attempts || [],
      attempts_error: attemptsError?.message || null,
      diagnosis: {
        has_enrollment: !!enrollment,
        enrollment_passed: enrollment?.passed || false,
        has_certificate: !!cert,
        certificate_has_pdf: !!(cert?.pdf_url),
        pdf_url: cert?.pdf_url || null,
        verification_code: cert?.verification_code || null
      }
    });

  } catch (error: any) {
    console.error('[debug/check-cert] Error:', error);
    return NextResponse.json({ 
      error: 'Debug check failed', 
      details: error.message 
    }, { status: 500 });
  }
}

