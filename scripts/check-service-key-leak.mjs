// scripts/check-service-key-leak.mjs
import fs from 'node:fs';
import path from 'node:path';
import { Buffer } from 'node:buffer';

const ROOT = process.cwd();
const STATIC_DIR = path.join(ROOT, '.next', 'static');
const offenders = [];
const keyPrefix = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').slice(0, 8);

// Patterns to detect actual security leaks
const serviceKeyPattern = /eyJ[A-Za-z0-9+\/=]{200,}/g; // JWT tokens are long base64 strings
const envVarPattern = /SUPABASE_SERVICE_ROLE_KEY/;

// Webpack patterns to IGNORE (these are normal and safe)
const webpackIgnorePatterns = [
  /Cannot find module/,
  /MODULE_NOT_FOUND/,
  /webpackChunk_N_E/,
  /function\([a-z]\)\{.*Error\("Cannot find module/,
  /keys=function\(\)\{return\[\]\}/
];

function isWebpackBoilerplate(text) {
  return webpackIgnorePatterns.some(pattern => pattern.test(text));
}

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) scan(p);
    else if (/\.(js|txt|html|json)$/.test(entry)) {
      const txt = fs.readFileSync(p, 'utf8');
      
      // Skip if this is webpack boilerplate code
      if (isWebpackBoilerplate(txt)) {
        continue;
      }
      
      // Check for actual service keys and environment variables
      const hasKeyPrefix = keyPrefix && txt.includes(keyPrefix);
      const hasEnvVar = envVarPattern.test(txt);
      const hasLongJWT = serviceKeyPattern.test(txt);
      
      // Additional check: if it's a long JWT, make sure it's a service key
      let isServiceKey = false;
      if (hasLongJWT) {
        const jwtMatches = txt.match(serviceKeyPattern);
        if (jwtMatches) {
          // Check if any JWT contains service_role (not anon)
          for (const jwt of jwtMatches) {
            try {
              const payload = jwt.split('.')[1];
              if (payload) {
                const decoded = Buffer.from(payload, 'base64').toString();
                if (decoded.includes('"role":"service_role"')) {
                  isServiceKey = true;
                  break;
                }
              }
            } catch (e) {
              // If decoding fails, treat as potential service key for safety
              isServiceKey = true;
            }
          }
        }
      }
      
      const hit = hasKeyPrefix || hasEnvVar || isServiceKey;
      if (hit) {
        const line = txt.split(/\n/).find(l => (
          (keyPrefix && l.includes(keyPrefix)) || envVarPattern.test(l) || serviceKeyPattern.test(l)
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