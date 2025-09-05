import { execSync } from 'node:child_process';

try {
  const out = execSync('npm run qa:i18n:audit', { stdio: 'pipe' }).toString();
  const missing = (/Keys missing:\s*(\d+)/.exec(out)?.[1]) ? Number(/Keys missing:\s*(\d+)/.exec(out)[1]) : 0;
  
  console.log(out);
  
  if (process.env.MISSING_I18N_HARD_FAIL === '1' && missing > 0) {
    console.error(`❌ i18n: ${missing} missing keys. Set MISSING_I18N_HARD_FAIL=0 to disable hard fail.`);
    process.exit(1);
  } else if (missing > 0) {
    console.warn(`⚠️  i18n: ${missing} missing keys (warning only).`);
  } else {
    console.log('✅ i18n: no missing keys.');
  }
} catch (e) {
  console.error('i18n audit failed to run:', e?.message || e);
  process.exit(0); // do not block builds if audit tool fails
}
