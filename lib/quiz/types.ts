export type Locale = 'en' | 'es';
export type QuizChoice = string; // keep it simple; could expand later
export type QuizItem = {
  id: string;
  module_slug: string; // e.g. 'pre-operation-inspection'
  locale: Locale;
  question: string;
  choices: QuizChoice[];
  correct_index: number; // 0-based
  explain?: string | null;
  difficulty?: number | null; // 1-5
  tags?: string[] | null;
  is_exam_candidate?: boolean | null;
  active?: boolean | null;
};

export type ExamPaper = {
  id: string;          // server-issued paper id (nonce)
  locale: Locale;
  items: Array<Pick<QuizItem,'id'|'question'|'choices'>>; // no answers leaked
  meta?: { count: number };
};

export type ExamSubmitPayload = {
  paper_id: string;
  answers: number[]; // same order as paper.items
};

export type ExamSubmitResult = {
  ok: boolean;
  passed: boolean;
  scorePct: number;
  correct: number;
  total: number;
  incorrectIndices: number[];
};
