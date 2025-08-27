// scripts/scan_i18n.mjs
import fs from 'node:fs';

function has(path, needle) {
  if (!fs.existsSync(path)) return false;
  return fs.readFileSync(path, 'utf8').includes(needle);
}

const results = [];
results.push({ check: 'app/layout.tsx uses <I18nProvider>', ok: has('app/layout.tsx', '<I18nProvider') });
results.push({ check: 'DemoPanel.tsx uses t(\'demo.start\')', ok: has('components/DemoPanel.tsx', "t('demo.start'") || has('components/DemoPanel.tsx', 't("demo.start"') });
results.push({ check: 'locales/en.json contains demo.start', ok: has('locales/en.json', 'demo.start') });
results.push({ check: 'locales/es.json contains demo.start', ok: has('locales/es.json', 'demo.start') });

let pass = true;
for (const r of results) { console.log(`[${r.ok ? 'PASS' : 'FAIL'}] ${r.check}`); if (!r.ok) pass = false; }
process.exit(pass ? 0 : 1);
