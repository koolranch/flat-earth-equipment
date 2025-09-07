export type ExamQuestion = { id: string; course_slug: string; locale: string; prompt: string; options: string[]; correct_option: number; tags?: string[]; difficulty?: number; active?: boolean };
export type PublicQuestion = Omit<ExamQuestion, 'correct_option'>;
export function sanitizeQuestion(q: ExamQuestion): PublicQuestion { const { correct_option, ...rest } = q; return rest; }
export const PASSING_FRACTION = 0.8; // 80%
export function grade(questions: ExamQuestion[], answers: { question_id: string; choice_index: number }[]) {
  const byId = new Map(questions.map(q => [q.id, q] as const));
  let correct = 0, total = questions.length;
  for (const a of answers) { const q = byId.get(a.question_id); if (!q) continue; if (a.choice_index === q.correct_option) correct++; }
  const score = total ? correct / total : 0;
  return { correct, total, score, passed: score >= PASSING_FRACTION };
}
