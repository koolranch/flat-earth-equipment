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
  session_id?: string; // session id for progress tracking
  locale: Locale;
  pass_score?: number; // configurable pass threshold
  time_limit_sec?: number; // exam time limit
  items: Array<Pick<QuizItem,'id'|'question'|'choices'>>; // no answers leaked
  meta?: { count: number };
};

export type ExamSession = {
  id: string;
  paper_id: string;
  remaining_sec: number;
  answers: number[];
  locale: Locale;
  items: Array<Pick<QuizItem,'id'|'question'|'choices'>>;
};

export type ExamResumeResponse = {
  ok: boolean;
  found: boolean;
  session?: ExamSession;
};

export type ExamSubmitPayload = {
  session_id: string;
  answers: number[]; // same order as paper.items
  course_id?: string;
};

export type ExamSubmitResult = {
  ok: boolean;
  passed: boolean;
  scorePct: number;
  correct: number;
  total: number;
  incorrectIndices: number[];
};
