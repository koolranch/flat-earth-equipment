import { requireAuthServer } from '@/lib/auth/requireAuthServer';
import { requireEnrollmentServer } from '@/lib/training/requireEnrollmentServer';
import { getOrCreateFinalExamForUser } from '@/lib/training/final-exam';
import FinalExamClient from './FinalExamClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FinalExamPage() {
  const user = await requireAuthServer();
  await requireEnrollmentServer({ courseSlug: 'forklift' });

  try {
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
          <p className="mt-2 text-red-600">{msg}</p>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-3xl py-6">
        <FinalExamClient sessionId={result.session.id} />
      </div>
    );
  } catch (e: any) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <h1 className="text-2xl font-semibold">Final Exam</h1>
        <p className="mt-2 text-red-600">Failed to load: {e?.message || 'unknown error'}</p>
      </div>
    );
  }
}
