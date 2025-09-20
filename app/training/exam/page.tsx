import { redirect } from 'next/navigation';
import { requireAuthServer } from '@/lib/auth/requireAuthServer';
import { requireEnrollmentServer } from '@/lib/training/requireEnrollmentServer';
import { getOrCreateFinalExamForUser } from '@/lib/training/final-exam';
import ExamWrapper from '@/components/training/ExamWrapper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FinalExamPage() {
  const user = await requireAuthServer();
  // Gate: must be enrolled in forklift
  await requireEnrollmentServer({ courseSlug: 'forklift' });

  const result = await getOrCreateFinalExamForUser(user.id);
  if (!result.ok) {
    const msg =
      result.reason === 'no-questions' ? 'Final exam is not configured for your modules yet.' :
      result.reason === 'paper-create-failed' ? 'Could not create an exam paper (schema mismatch).' :
      result.reason === 'session-create-failed' ? 'Could not start a session (RLS or schema).' :
      'Unable to start exam.';
    return (
      <div className="mx-auto max-w-3xl py-10">
        <h1 className="text-2xl font-semibold">Final Exam</h1>
        <p className="mt-2 text-slate-600">{msg}</p>
        <div className="mt-4">
          <a href="/training" className="btn border">
            Back to Training
          </a>
        </div>
      </div>
    );
  }

  // Use the existing ExamWrapper with the session ID
  return (
    <div className="mx-auto max-w-3xl py-6">
      <ExamWrapper 
        mode={result.mode === 'resume' ? 'resume' : 'create'}
        sessionData={result.mode === 'resume' ? result.session : undefined}
      />
    </div>
  );
}
