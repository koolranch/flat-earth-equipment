import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const course_id = url.searchParams.get('course_id') || '';
  if (!course_id) return NextResponse.json({ ok: false, error: 'missing_course_id' }, { status: 400 });

  const sb = supabaseServer();
  const svc = supabaseService();
  
  // Authentication check
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  // Role authorization check
  const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['trainer', 'admin'].includes(prof.role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  // Get enrollments for the course
  const { data: enrollments, error: enrollmentError } = await svc
    .from('enrollments')
    .select('id, user_id, progress_pct, created_at, passed')
    .eq('course_id', course_id)
    .order('created_at', { ascending: false });

  if (enrollmentError) {
    return NextResponse.json({ ok: false, error: enrollmentError.message }, { status: 500 });
  }

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ ok: true, count: 0, rows: [] });
  }

  const userIds = Array.from(new Set(enrollments.map(e => e.user_id)));
  const enrollmentIds = Array.from(new Set(enrollments.map(e => e.id)));

  // Get user profiles
  const { data: profiles } = await svc
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds);
  const profileByUserId = Object.fromEntries((profiles || []).map(p => [p.id, p]));

  // Get latest exam attempts per enrollment
  const { data: attempts } = await svc
    .from('exam_attempts')
    .select('enrollment_id, score_pct, created_at, passed')
    .in('enrollment_id', enrollmentIds)
    .order('created_at', { ascending: false });

  const latestExamByEnrollment: Record<string, { score_pct: number | null; attempts: number; passed: boolean | null }> = {};
  if (attempts) {
    const attemptCounts: Record<string, number> = {};
    const seenEnrollments = new Set<string>();
    
    for (const attempt of attempts) {
      const enrollId = attempt.enrollment_id;
      attemptCounts[enrollId] = (attemptCounts[enrollId] || 0) + 1;
      
      // Store the latest (first due to DESC order) attempt details
      if (!seenEnrollments.has(enrollId)) {
        latestExamByEnrollment[enrollId] = {
          score_pct: attempt.score_pct,
          attempts: attemptCounts[enrollId],
          passed: attempt.passed
        };
        seenEnrollments.add(enrollId);
      }
    }
    
    // Update attempt counts for all enrollments
    for (const enrollId of Object.keys(latestExamByEnrollment)) {
      latestExamByEnrollment[enrollId].attempts = attemptCounts[enrollId] || 1;
    }
  }

  // Get certificates
  const { data: certificates } = await svc
    .from('certificates')
    .select('enrollment_id, pdf_url, verification_code, issued_at')
    .in('enrollment_id', enrollmentIds);
  const certificateByEnrollment = Object.fromEntries((certificates || []).map(c => [c.enrollment_id, c]));

  // Get employer evaluations (practical assessments)
  const { data: evaluations } = await svc
    .from('employer_evaluations')
    .select('enrollment_id, practical_pass, evaluation_date, evaluator_name')
    .in('enrollment_id', enrollmentIds)
    .order('evaluation_date', { ascending: false });

  const evaluationByEnrollment = Object.fromEntries((evaluations || []).map(e => [e.enrollment_id, e]));

  // Build comprehensive roster rows
  const rows = enrollments.map(enrollment => {
    const profile = profileByUserId[enrollment.user_id];
    const exam = latestExamByEnrollment[enrollment.id] || { score_pct: null, attempts: 0, passed: null };
    const certificate = certificateByEnrollment[enrollment.id] || null;
    const evaluation = evaluationByEnrollment[enrollment.id] || null;

    return {
      enrollment_id: enrollment.id,
      user_id: enrollment.user_id,
      learner: {
        name: profile?.full_name || '',
        email: profile?.email || ''
      },
      progress_pct: enrollment.progress_pct || 0,
      enrollment_passed: enrollment.passed || false,
      exam: {
        latest_score_pct: exam.score_pct,
        total_attempts: exam.attempts,
        exam_passed: exam.passed
      },
      certificate: certificate ? {
        pdf_url: certificate.pdf_url,
        verification_code: certificate.verification_code,
        issued_at: certificate.issued_at
      } : null,
      evaluation: evaluation ? {
        practical_pass: evaluation.practical_pass,
        evaluation_date: evaluation.evaluation_date,
        evaluator_name: evaluation.evaluator_name
      } : null,
      enrolled_at: enrollment.created_at
    };
  });

  return NextResponse.json({ 
    ok: true, 
    count: rows.length, 
    rows,
    course_id 
  });
}
