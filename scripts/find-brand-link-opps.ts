import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SEARCH_DIRS = ['app/parts', 'app/insights'];
const BRANDS = ['jlg','genie','toyota','jcb','hyster'];

function walk(dir: string, out: string[] = []){
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.isFile() && /\.(tsx|mdx?)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = SEARCH_DIRS.flatMap(d => fs.existsSync(path.join(ROOT,d)) ? walk(path.join(ROOT,d)) : []);
const hits: Record<string,string[]> = {};
for (const f of files){
  const text = fs.readFileSync(f,'utf8').toLowerCase();
  for (const b of BRANDS){
    if (text.includes(b)) {
      if (!hits[b]) hits[b] = [];
      hits[b].push(f.replace(ROOT+'/',''));
    }
  }
}

for (const b of BRANDS){
  const list = hits[b] || [];
  console.log(`\n[${b}] ${list.length} potential link targets`);
  for (const f of list.slice(0,50)) console.log('  -', f);
}
