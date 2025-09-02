import crypto from 'crypto';

export const QUIZ_CSV_HEADER = [
  'module_slug',     // e.g. pre-operation-inspection
  'locale',          // en | es
  'question',
  'choice_0',
  'choice_1',
  'choice_2',
  'choice_3',
  'choice_4',
  'choice_5',
  'correct_index',   // 0-based index into provided choices
  'explain',         // optional explanation
  'difficulty',      // optional 1-5
  'tags',            // comma-separated list
  'is_exam_candidate', // true|false
  'active'           // true|false
].join(',');

export type RawRow = Record<string,string>;
export type ImportRow = {
  module_slug: string;
  locale: 'en'|'es';
  question: string;
  choices: string[]; // 2..6
  correct_index: number;
  explain?: string|null;
  difficulty?: number|null; // 1..5
  tags?: string[]|null;
  is_exam_candidate?: boolean|null;
  active?: boolean|null;
};

export function normalizeRow(r: RawRow): { ok: true; row: ImportRow } | { ok:false; error:string }{
  const module_slug = String(r.module_slug||'').trim();
  const locale = (String(r.locale||'en').trim() as 'en'|'es');
  const question = String(r.question||'').trim();
  const choices = [0,1,2,3,4,5].map(i=> r[`choice_${i}`]).filter(Boolean).map(s=> String(s).trim());
  const correct_index = Number(r.correct_index ?? -1);
  const explain = (r.explain?.trim()) || null;
  const difficulty = r.difficulty ? Number(r.difficulty) : null;
  const tags = r.tags ? String(r.tags).split(',').map(s=> s.trim()).filter(Boolean) : null;
  const is_exam_candidate = r.is_exam_candidate ? (/^(true|1|yes)$/i).test(String(r.is_exam_candidate)) : null;
  const active = r.active ? (/^(true|1|yes)$/i).test(String(r.active)) : null;

  if (!module_slug) return { ok:false, error:'module_slug required' };
  if (!(locale==='en' || locale==='es')) return { ok:false, error:'locale must be en|es' };
  if (!question) return { ok:false, error:'question required' };
  if (choices.length < 2) return { ok:false, error:'at least 2 choices required' };
  if (!(correct_index >= 0 && correct_index < choices.length)) return { ok:false, error:'correct_index out of bounds' };
  if (difficulty != null && !(difficulty>=1 && difficulty<=5)) return { ok:false, error:'difficulty must be 1..5' };
  return { ok:true, row: { module_slug, locale, question, choices, correct_index, explain, difficulty, tags, is_exam_candidate, active } };
}

export function contentHash(row: ImportRow){
  const payload = JSON.stringify({ m: row.module_slug, l: row.locale, q: row.question, c: row.choices });
  return crypto.createHash('sha256').update(payload).digest('hex');
}
