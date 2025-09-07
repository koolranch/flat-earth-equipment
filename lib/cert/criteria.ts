export type EligibilityReason = { key: string; message: string };
export type EligibilityResult = { eligible: boolean; reasons: EligibilityReason[] };

// You can tweak the rules here (per course/locale later if needed)
export async function checkEligibility(params: {
  userId: string;
  courseSlug?: string;
}): Promise<EligibilityResult> {
  const courseSlug = params.courseSlug || 'forklift_operator';

  // Hit your own APIs (server-to-server) to gather completion state
  const [demosRes, quizRes, practicalRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/progress/demos?user=${params.userId}&course=${courseSlug}`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/progress/quiz?user=${params.userId}&course=${courseSlug}`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/practical/latest?user=${params.userId}&course=${courseSlug}`, { cache: 'no-store' })
  ]);

  const [demos, quiz, practical] = await Promise.all([demosRes.json(), quizRes.json(), practicalRes.json()]);

  const reasons: EligibilityReason[] = [];
  if (!demos?.allComplete) reasons.push({ key: 'demos', message: 'Complete all required demos.' });
  if (!quiz?.passed) reasons.push({ key: 'quiz', message: 'Pass the knowledge quiz.' });
  if (!practical?.passed) reasons.push({ key: 'practical', message: 'Supervisor practical must be marked Passed.' });

  return { eligible: reasons.length === 0, reasons };
}
