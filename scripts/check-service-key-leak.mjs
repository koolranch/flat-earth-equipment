import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const STATIC_DIR = path.join(ROOT, '.next', 'static');
const bad = [];
const needleValue = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').slice(0, 8);
const needleName = 'SUPABASE_SERVICE_ROLE_KEY';

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) scan(p);
    else if (/\.(js|txt|html|json)$/.test(entry)) {
      const txt = fs.readFileSync(p, 'utf8');
      if (needleValue && txt.includes(needleValue)) bad.push(p);
      if (txt.includes(needleName)) bad.push(p);
    }
  }
}

scan(STATIC_DIR);

if (bad.length) {
  console.error('\n[SECURITY] Service role key reference found in client bundle files:');
  for (const f of bad) console.error(' -', path.relative(ROOT, f));
  process.exit(1);
} else {
  console.log('[OK] No service-role key references detected in client bundle.');
}
