import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { requireEnrollmentServer } from '@/lib/training/requireEnrollmentServer';
import { getOrCreateFinalExam, checkModuleCompletion } from '@/lib/training/final-exam';
import ExamWrapper from '@/components/training/ExamWrapper';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const COURSE_SLUG = process.env.TRAINING_COURSE_SLUG || 'forklift';

export default async function FinalExamPage() {
  // Require authentication and enrollment
  const enrollment = await requireEnrollmentServer({ 
    courseSlug: COURSE_SLUG,
    checkoutPath: '/training/checkout' 
  });

  // Check if user has completed required modules
  const moduleCheck = await checkModuleCompletion(COURSE_SLUG);
  if (!moduleCheck.ok) {
    redirect('/training?exam=locked&reason=modules-incomplete');
  }

  // Get or create final exam session
  const result = await getOrCreateFinalExam(COURSE_SLUG);
  
  if (!result.ok) {
    const reason = result.reason;
    let message = 'Unable to start exam.';
    
    switch (reason) {
      case 'unauthorized':
        redirect('/login?redirect=/training/exam');
        break;
      case 'course-not-found':
        message = 'Training course not found.';
        break;
      case 'no-questions':
        message = 'Final exam is not configured yet. Check quiz_items or exam_settings.';
        break;
      default:
        message = 'Unable to start exam. Please try again.';
    }
    
    return (
      <div className="mx-auto max-w-3xl py-10">
        <h1 className="text-2xl font-semibold">Final Exam</h1>
        <p className="mt-2 text-slate-600">{message}</p>
        <div className="mt-4">
          <a href="/training" className="btn border">
            Back to Training
          </a>
        </div>
      </div>
    );
  }

  // If we have an existing session, pass the session data
  if (result.mode === 'resume') {
    return (
      <ExamWrapper 
        mode="resume" 
        sessionData={result.session}
      />
    );
  }

  // Otherwise, let the client component create a new exam
  return (
    <ExamWrapper 
      mode="create" 
    />
  );
}
