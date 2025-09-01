import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { FINAL_EXAM, getExamItems, validateAnswer } from '@/lib/training/exam.items';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SubmissionBody {
  answers: Record<string, string>;
  locale?: string;
  exam_id?: string; // Optional exam session ID for tracking
}

interface IncorrectAnswer {
  id: string;
  prompt: string;
  correctId: string;
  selectedId: string;
  explanation: string;
}

export async function POST(req: Request) {
  const requestStartTime = Date.now();
  const sb = supabaseServer();
  const svc = supabaseService();
  
  // Authentication check
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    // Parse request body
    const body: SubmissionBody = await req.json();
    const { answers = {}, locale = 'en', exam_id } = body;

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ 
        ok: false, 
        error: 'no_answers_provided' 
      }, { status: 400 });
    }

    // Get exam items for the specified locale
    const examItems = getExamItems(locale as 'en' | 'es');
    const passPct = FINAL_EXAM.passPct;

    // Find the user's most recent enrollment
    const { data: enrollment, error: enrollmentError } = await sb
      .from('enrollments')
      .select('id, course_id, user_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (enrollmentError || !enrollment) {
      return NextResponse.json({ 
        ok: false, 
        error: 'no_enrollment_found' 
      }, { status: 400 });
    }

    // Score the exam
    let correctCount = 0;
    const incorrectAnswers: IncorrectAnswer[] = [];
    const scoringDetails: Record<string, { correct: boolean; selectedId: string }> = {};

    for (const item of examItems) {
      const selectedAnswer = answers[item.id];
      const isCorrect = selectedAnswer === item.correctId;
      
      scoringDetails[item.id] = {
        correct: isCorrect,
        selectedId: selectedAnswer || ''
      };

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectAnswers.push({
          id: item.id,
          prompt: item.prompt,
          correctId: item.correctId,
          selectedId: selectedAnswer || '',
          explanation: item.explanation
        });
      }
    }

    const totalQuestions = examItems.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= passPct;
    const durationSeconds = Math.round((Date.now() - requestStartTime) / 1000);

    // Store exam attempt
    const attemptData = {
      user_id: user.id,
      enrollment_id: enrollment.id,
      exam_type: 'final',
      exam_id: exam_id || null,
      locale,
      items_total: totalQuestions,
      items_correct: correctCount,
      score_pct: scorePercentage,
      passed,
      duration_seconds: durationSeconds,
      answers_data: answers,
      scoring_details: scoringDetails,
      created_at: new Date().toISOString()
    };

    const { data: attemptRecord, error: attemptError } = await svc
      .from('exam_attempts')
      .insert(attemptData)
      .select('id')
      .single();

    if (attemptError) {
      console.error('Error storing exam attempt:', attemptError);
      return NextResponse.json({ 
        ok: false, 
        error: 'failed_to_store_attempt',
        details: attemptError.message 
      }, { status: 500 });
    }

    // Update enrollment if passed
    if (passed) {
      try {
        await svc
          .from('enrollments')
          .update({ 
            passed: true, 
            progress_pct: 100,
            completed_at: new Date().toISOString()
          })
          .eq('id', enrollment.id);
      } catch (updateError) {
        console.error('Error updating enrollment:', updateError);
        // Don't fail the request if enrollment update fails
      }

      // Trigger certificate issuance (best effort)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const certResponse = await fetch(`${baseUrl}/api/cert/issue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            enrollment_id: enrollment.id 
          })
        });

        if (!certResponse.ok) {
          console.error('Certificate issuance failed:', await certResponse.text());
        }
      } catch (certError) {
        console.error('Error triggering certificate issuance:', certError);
        // Don't fail the exam submission if certificate issuance fails
      }
    }

    // Audit log entry
    try {
      await svc.from('audit_log').insert({
        actor_id: user.id,
        action: passed ? 'exam_passed' : 'exam_failed',
        metadata: {
          exam_type: 'final',
          exam_id: exam_id || null,
          enrollment_id: enrollment.id,
          score_pct: scorePercentage,
          items_correct: correctCount,
          items_total: totalQuestions,
          duration_seconds: durationSeconds,
          locale
        }
      });
    } catch (auditError) {
      console.error('Error logging audit entry:', auditError);
      // Don't fail the request if audit logging fails
    }

    // Return comprehensive results
    return NextResponse.json({
      ok: true,
      passed,
      score_pct: scorePercentage,
      items_correct: correctCount,
      items_total: totalQuestions,
      pass_threshold: passPct,
      duration_seconds: durationSeconds,
      attempt_id: attemptRecord.id,
      incorrect: incorrectAnswers,
      certificate_issued: passed, // Will be true if passed, indicating cert issuance was triggered
      next_steps: passed 
        ? 'Congratulations! Your certificate will be available on your Records page shortly.'
        : `You scored ${scorePercentage}%. You need ${passPct}% to pass. Please review the training materials and try again.`
    });

  } catch (error) {
    console.error('Exam submission error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'internal_server_error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
