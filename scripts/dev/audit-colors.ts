import fs from 'fs';
import path from 'path';

const roots = ['app', 'components', 'lib', 'styles'];
const HEX = /#[0-9a-fA-F]{3,8}/g;

function walk(dir: string, out: string[]) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(tsx?|css|scss|mdx?)$/.test(p)) out.push(p);
  }
}

const files: string[] = [];
roots.forEach(r => fs.existsSync(r) && walk(r, files));

console.log('🎨 COLOR AUDIT - Hard-coded hex values found:');
console.log('='.repeat(50));

for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const m = t.match(HEX);
  if (m) {
    console.log(`📁 ${f}`);
    console.log(`   → ${Array.from(new Set(m)).join(', ')}`);
  }
}

console.log('\n💡 Next steps:');
console.log('- Replace hard-coded hex with brand tokens or Tailwind classes');
console.log('- Use var(--brand-accent) instead of specific hex colors');
console.log('- Update components to use unified brand system');
