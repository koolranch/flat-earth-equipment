import type { ExamPaper, ExamSubmitPayload, ExamSubmitResult } from './types';

export async function fetchModuleQuiz(slug: string, locale: 'en'|'es' = 'en'){
  const res = await fetch(`/api/quiz/module/${slug}?locale=${locale}`, { cache:'no-store' });
  if (!res.ok) throw new Error('quiz_load_failed');
  return await res.json();
}

export async function generateExam(locale: 'en'|'es' = 'en'): Promise<ExamPaper>{
  const res = await fetch(`/api/exam/generate?locale=${locale}`, { method:'POST' });
  if (!res.ok) throw new Error('exam_generate_failed');
  return await res.json();
}

export async function submitExam(payload: ExamSubmitPayload): Promise<ExamSubmitResult>{
  const res = await fetch('/api/exam/submit', { 
    method:'POST', 
    headers:{ 'Content-Type':'application/json' }, 
    body: JSON.stringify(payload) 
  });
  if (!res.ok) throw new Error('exam_submit_failed');
  return await res.json();
}
