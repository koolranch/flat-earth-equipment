import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pub = path.join(root, 'public');
const file = path.join(root, 'content/training/forklift-operator/module-1/preop-flashcards.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const missing = [];
for (const c of data.cards || []) {
  if (!c.icon) continue;
  const p = path.join(pub, c.icon);
  if (!fs.existsSync(p)) {
    missing.push({ id: c.id, icon: c.icon });
  }
}
if (missing.length) {
  console.log('❌ Missing flash card icons:');
  for (const m of missing) console.log('-', m.id, '→', m.icon);
  process.exitCode = 1;
} else {
  console.log('✅ All flash card icons found in /public');
}
