import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), '.next', 'static', 'chunks');
const forbidden = [/SUPABASE_SERVICE_ROLE_KEY/i, /lib\/(?:supabase)\/service/i];

function getFiles(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.js')).map(f => ({ 
    file: f, 
    size: fs.statSync(path.join(dir, f)).size 
  }));
}

if (!fs.existsSync(root)) { 
  console.error('No .next/static/chunks found. Build first.'); 
  process.exit(1); 
}

const files = getFiles(root).sort((a, b) => b.size - a.size).slice(0, 20);
console.log('Top client chunks by size:');
files.forEach((f, i) => console.log(String(i + 1).padStart(2, ' '), f.size, f.file));

let failed = false;
for (const f of files) {
  const text = fs.readFileSync(path.join(root, f.file), 'utf8');
  for (const pat of forbidden) {
    if (pat.test(text)) { 
      console.error(`FORBIDDEN token in ${f.file}: ${pat}`); 
      failed = true; 
    }
  }
}

if (failed) {
  console.error('analyze:ci FAILED due to forbidden tokens.');
  process.exit(2);
}

console.log('analyze:ci OK');
