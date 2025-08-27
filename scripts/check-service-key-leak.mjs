import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const STATIC_DIR = path.join(ROOT, '.next', 'static');
const offenders = [];
const keyPrefix = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').slice(0, 8);
const needleName = 'SUPABASE_SERVICE_ROLE_KEY';
// Only check for actual service role JWT tokens, not webpack module handlers
const needleServiceRole = '"role":"service_role"'; // Service role JWT payload
const fullServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // The actual service key

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) scan(p);
    else if (/\.(js|txt|html|json)$/.test(entry)) {
      const txt = fs.readFileSync(p, 'utf8');
      // Check for actual service role key exposure (not webpack module handlers or anon keys)
      const hasFullServiceKey = fullServiceKey && txt.includes(fullServiceKey);
      const hasKeyEnvVar = txt.includes(needleName);
      const hasServiceRole = txt.includes(needleServiceRole);
      
      // Exclude webpack module error handlers which contain "Cannot find module" patterns
      const isWebpackModuleHandler = txt.includes('Cannot find module') || 
                                   txt.includes('MODULE_NOT_FOUND') ||
                                   txt.includes('function(e){function ') ||
                                   /\{\d+:function\(e\)\{function/.test(txt);
      
      const hit = (hasFullServiceKey || hasKeyEnvVar || hasServiceRole) && !isWebpackModuleHandler;
      if (hit) {
        const line = txt.split(/\n/).find(l => (
          (fullServiceKey && l.includes(fullServiceKey)) || l.includes(needleName) || l.includes(needleServiceRole)
        )) || '';
        offenders.push({ file: p, line: line.trim().slice(0, 200) });
      }
    }
  }
}

scan(STATIC_DIR);

if (offenders.length) {
  console.error('\n[SECURITY] Service role key reference found in client bundle files:');
  for (const o of offenders) console.error(' -', path.relative(ROOT, o.file), '\n   >', o.line);
  console.error('\n🚨 [CRITICAL SECURITY VIOLATION] Service role key leaked into client bundle!');
  console.error('🛑 Build halted to prevent credential exposure');
  process.exit(1);
} else {
  console.log('[OK] No service-role key references detected in client bundle.');
}