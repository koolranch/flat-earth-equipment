export type QuizChoiceQ = { id: string; type: 'mc'; prompt: string; choices: string[]; answer: number };
export type Quiz = { module: number; pass_score: number; questions: QuizChoiceQ[] };

export async function loadQuiz(module: number, locale: string = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en')): Promise<Quiz> {
  const url = `/quiz/${locale}/module${module}.json`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Quiz load failed: ${url}`);
  return res.json();
}
