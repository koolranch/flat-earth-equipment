import fs from 'node:fs';
import path from 'node:path';

const p = process.argv[2] || 'ahrefs.csv';
const raw = fs.readFileSync(p, 'utf8');
const lines = raw.split('\n');
const header = lines.shift();
const cols = header?.split(',') || [];
const urlIdx = cols.indexOf('URL');
const jsIdx = cols.indexOf('Linked JavaScripts');
const codesIdx = cols.indexOf('Linked JavaScripts codes');

const broken = new Map<string, number>();
for (const line of lines) {
  const cells = line.split(',');
  const js = (cells[jsIdx]||'').split(/\n/);
  const codes = (cells[codesIdx]||'').split(/\n/);
  for (let i=0;i<Math.min(js.length, codes.length);i++) {
    if (codes[i].trim() !== '200') broken.set(js[i].trim(), (broken.get(js[i].trim())||0)+1);
  }
}
const top = [...broken.entries()].sort((a,b)=>b[1]-a[1]).slice(0,20);
console.log('Top broken assets:');
for (const [u,c] of top) console.log(c.toString().padStart(4), u);

