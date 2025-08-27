import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const STATIC_DIR = path.join(ROOT, '.next', 'static');
const offenders = [];
const keyPrefix = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').slice(0, 8);
const needleName = 'SUPABASE_SERVICE_ROLE_KEY';
const needleModule = '@/lib/supabase/service'; // legacy path
const needleServer = '@/lib/supabase/service.server';

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) scan(p);
    else if (/\.(js|txt|html|json)$/.test(entry)) {
      const txt = fs.readFileSync(p, 'utf8');
      const hit = (keyPrefix && txt.includes(keyPrefix)) || txt.includes(needleName) || txt.includes(needleModule) || txt.includes(needleServer);
      if (hit) {
        const line = txt.split(/\n/).find(l => (
          (keyPrefix && l.includes(keyPrefix)) || l.includes(needleName) || l.includes(needleModule) || l.includes(needleServer)
        )) || '';
        offenders.push({ file: p, line: line.trim().slice(0, 200) });
      }
    }
  }
}

scan(STATIC_DIR);

if (offenders.length) {
  console.error('\n[SECURITY] Sensitive reference found in client bundle files:');
  for (const o of offenders) console.error(' -', path.relative(ROOT, o.file), '\n   >', o.line);
  process.exit(1);
} else {
  console.log('[OK] No service-role references detected in client bundle.');
}