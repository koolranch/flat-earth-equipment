// scripts/i18n_audit.mjs
import fs from 'node:fs';
import path from 'node:path';

const en = JSON.parse(fs.readFileSync('locales/en.json','utf8'));
const usedKeys = new Set();
const hardcoded = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) {
      const txt = fs.readFileSync(p,'utf8');
      // collect useT('key') keys and t('key') calls
      for (const m of txt.matchAll(/(?:useT\(\)|t\()\s*['"]([^'"]+)['"]/g)) {
        const key = m[1];
        if (key) usedKeys.add(key);
      }
      // naive hardcoded text in JSX (text between >...< tags)
      for (const m of txt.matchAll(/>([A-Z][A-Za-z0-9 ,.''!?-]{4,})</g)) {
        const s = m[1].trim();
        // Filter out common patterns that are NOT user-facing text
        if (!/^(return|export|function|class|div|span|button|Link|Image|Head|Script|true|false|null|undefined|Form|Input|Select|Option|Table|tbody|thead|tr|td|th|main|section|article|nav|header|footer|Loading|Error|Success|OK|Yes|No|USD|FAQ|PDF|CSV|JSON|API|URL|ID|SKU|OSHA|OEM)$/i.test(s) && 
            !s.match(/^\d+$/) && 
            !s.includes('${') &&
            !s.startsWith('//') &&
            !s.startsWith('/*') &&
            !s.includes('...') &&
            !s.match(/^[A-Z]+$/)) { // Skip all-caps (likely constants)
          hardcoded.push({ file: p, text: s });
        }
      }
    }
  }
}

['app','components'].filter(d=>fs.existsSync(d)).forEach(walk);

const missing = Array.from(usedKeys).filter(k => 
  en[k] === undefined && 
  k.length > 1 && 
  !k.includes(',') && 
  !k.includes('/') && 
  !k.includes('*') &&
  !k.includes('(') &&
  !k.includes('=') &&
  !k.match(/^[a-z_]+$/) && // likely field names
  !k.match(/^\d/) // starts with number
);

console.log('🔍 i18n Audit Report\n');

console.log('❌ Missing dictionary keys (EN):');
if (missing.length === 0) {
  console.log('   ✅ No missing keys found!');
} else {
  missing.forEach(k=>console.log(`   - ${k}`));
}

console.log('\n⚠️  Possible hardcoded strings:');
if (hardcoded.length === 0) {
  console.log('   ✅ No obvious hardcoded strings found!');
} else {
  const limited = hardcoded.slice(0, 50); // Limit to first 50 for readability
  limited.forEach(h=>console.log(`   - ${path.relative('.', h.file)} :: "${h.text}"`));
  if (hardcoded.length > 50) {
    console.log(`   ... and ${hardcoded.length - 50} more`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   - Keys used: ${usedKeys.size}`);
console.log(`   - Keys missing: ${missing.length}`);
console.log(`   - Hardcoded strings found: ${hardcoded.length}`);
console.log(`   - Files scanned: ${fs.readdirSync('app', {recursive: true}).filter(f => f.endsWith('.tsx')).length + fs.readdirSync('components', {recursive: true}).filter(f => f.endsWith('.tsx')).length}`);
