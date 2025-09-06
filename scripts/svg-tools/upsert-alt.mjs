import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [,, filePath, ...altParts] = process.argv;
if (!filePath || altParts.length === 0){
  console.error('Usage: node scripts/svg-tools/upsert-alt.mjs <filePath> <alt text...>');
  process.exit(2);
}
const alt = altParts.join(' ').trim();
const mapPath = 'content/alt/diagrams.json';
const dir = dirname(mapPath);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
let obj = {};
if (existsSync(mapPath)) {
  try { obj = JSON.parse(readFileSync(mapPath, 'utf8') || '{}'); } catch {}
}
obj[filePath] = alt;
writeFileSync(mapPath, JSON.stringify(obj, null, 2) + '\n', 'utf8');
console.log('✅ Alt text updated for', filePath);
