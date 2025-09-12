// Migrate content/training/forklift-operator/module-*/flashcards.json
// => public/flashcards/module-*.json (normalized to {q,a,img})
import { promises as fs } from 'fs';
import path from 'path';

const SRC_ROOT = path.resolve(process.cwd(), 'content/training/forklift-operator');
const DEST_ROOT = path.resolve(process.cwd(), 'public/flashcards');
const MODS = ['module-1','module-2','module-3','module-4','module-5'];

const norm = (cards) => {
  if (!Array.isArray(cards)) return [];
  return cards.map((c) => ({
    q: c.q ?? c.question ?? c.front ?? '',
    a: c.a ?? c.answer ?? c.back ?? '',
    img: c.img ?? undefined
  })).filter(c => c.q && c.a);
};

async function main(){
  await fs.mkdir(DEST_ROOT, { recursive: true });
  const results = [];
  for (const m of MODS){
    const src = path.join(SRC_ROOT, m, 'flashcards.json');
    const dest = path.join(DEST_ROOT, `${m}.json`);
    try {
      const raw = await fs.readFile(src, 'utf8');
      const data = JSON.parse(raw);
      const out = norm(data);
      await fs.writeFile(dest, JSON.stringify(out, null, 2));
      results.push({ module: m, count: out.length, wrote: dest });
    } catch (e){
      // ok if a module doesn't have cards yet
      results.push({ module: m, skipped: true, reason: e.message });
    }
  }
  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});