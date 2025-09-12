import fs from "node:fs";
import path from "node:path";

export type FlashCard = { id:string; front:string; back:string; tag:string; image?:string|null };
export type QuizChoice = { key:string; text:string; correct?:boolean };
export type QuizItem = {
  id:string; type:"single"|"multi"|"truefalse";
  stem:string; choices:QuizChoice[]; difficulty:number; tag:string; rationale:string; image?:string|null;
};

function readJSON<T>(p:string): T {
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw) as T;
}

export function loadFlashCards(mod:"m1"|"m2"|"m3"|"m4"|"m5", locale="en"): FlashCard[] {
  const p = path.join(process.cwd(), "content", "flashcards", `${mod}.${locale}.json`);
  return readJSON<FlashCard[]>(p);
}
export function loadQuiz(mod:"m1"|"m2"|"m3"|"m4"|"m5", locale="en"): QuizItem[] {
  const p = path.join(process.cwd(), "content", "quizzes", `${mod}.${locale}.json`);
  return readJSON<QuizItem[]>(p);
}

export function shuffle<T>(arr:T[], seed?:number): T[] {
  let a = arr.slice(); let r = seed ?? Date.now();
  for (let i=a.length-1;i>0;i--) { r = (r*9301 + 49297) % 233280; const j = Math.floor((r/233280)*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
