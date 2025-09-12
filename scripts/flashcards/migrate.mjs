// Migrate content/flashcards/m*.en.json => public/flashcards/module-*.json 
// (normalized to {id,front,back,icon} format for FlashDeck)
import { promises as fs } from 'fs';
import path from 'path';

const SRC_ROOT = path.resolve(process.cwd(), 'content/flashcards');
const DEST_ROOT = path.resolve(process.cwd(), 'public/flashcards');
const MODS = [
  { src: 'm1.en.json', dest: 'module-1.json' },
  { src: 'm2.en.json', dest: 'module-2.json' },
  { src: 'm3.en.json', dest: 'module-3.json' },
  { src: 'm4.en.json', dest: 'module-4.json' },
  { src: 'm5.en.json', dest: 'module-5.json' }
];

const norm = (cards) => {
  if (!Array.isArray(cards)) return [];
  return cards.map((c) => ({
    id: c.id,
    front: c.front,
    back: c.back,
    icon: c.image
  })).filter(c => c.front && c.back);
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
      const out = norm(data);
      await fs.writeFile(dest, JSON.stringify(out, null, 2));
      results.push({ module: m.src, count: out.length, wrote: dest });
    } catch (e){
      // ok if a module doesn't have cards yet
      results.push({ module: m.src, skipped: true, reason: e.message });
    }
  }
  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});