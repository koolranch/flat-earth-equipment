// Migrate content/quizzes/m*.en.json => public/quiz/en/module*.json
// Convert from new format to existing quiz system format
import { promises as fs } from 'fs';
import path from 'path';

const SRC_ROOT = path.resolve(process.cwd(), 'content/quizzes');
const DEST_ROOT = path.resolve(process.cwd(), 'public/quiz/en');
const MODS = [
  { src: 'm1.en.json', dest: 'module1.json', moduleNum: 1 },
  { src: 'm2.en.json', dest: 'module2.json', moduleNum: 2 },
  { src: 'm3.en.json', dest: 'module3.json', moduleNum: 3 },
  { src: 'm4.en.json', dest: 'module4.json', moduleNum: 4 },
  { src: 'm5.en.json', dest: 'module5.json', moduleNum: 5 }
];

// Convert new quiz format to existing format
const convertQuiz = (questions, moduleNum) => {
  return {
    module: moduleNum,
    pass_score: 80,
    questions: questions.map((q, index) => ({
      id: q.id,
      type: 'mc',
      prompt: q.stem,
      choices: q.choices.map(c => c.text),
      answer: q.choices.findIndex(c => c.correct === true)
    }))
  };
};

async function main(){
  await fs.mkdir(DEST_ROOT, { recursive: true });
  const results = [];
  
  for (const m of MODS){
    const src = path.join(SRC_ROOT, m.src);
    const dest = path.join(DEST_ROOT, m.dest);
    
    try {
      const raw = await fs.readFile(src, 'utf8');
      const data = JSON.parse(raw);
      const converted = convertQuiz(data, m.moduleNum);
      await fs.writeFile(dest, JSON.stringify(converted, null, 2));
      results.push({ module: m.src, questions: data.length, wrote: dest });
    } catch (e){
      results.push({ module: m.src, skipped: true, reason: e.message });
    }
  }
  
  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
