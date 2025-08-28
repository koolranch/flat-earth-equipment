import { execSync } from 'node:child_process';

// Simple argv parser: --base-url= --learner= --course=
const args = Object.fromEntries(process.argv.slice(2).map(kv => {
  const [k, v] = kv.split('=');
  return [k.replace(/^--/, ''), v ?? ''];
}));

const BASE_URL = args['base-url'] || process.env.BASE_URL || 'http://localhost:3000';
const LEARNER_ID = args['learner'] || process.env.LEARNER_ID || '';
const COURSE_ID  = args['course']  || process.env.COURSE_ID  || '';

function run(cmd, extraEnv = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...extraEnv } });
}

console.log('\n🧰 Build + QA Runner');
console.log('--------------------------------------------------');
console.log('ENV  BASE_URL =', BASE_URL);
if (!LEARNER_ID || !COURSE_ID) {
  console.log('ℹ️  Note: LEARNER_ID/COURSE_ID not set — if your qa:all script includes cert E2E, that step may fail.');
  console.log('   Provide them via CLI: --learner=<uuid> --course=<uuid>');
}

try {
  // 1) Build (triggers postbuild security scan)
  run('npm run build');

  // 2) Full QA bundle (i18n scan + cert E2E + Playwright tests)
  run('npm run qa:all', { BASE_URL, LEARNER_ID, COURSE_ID });

  console.log('\n✅ Build + QA complete');
} catch (e) {
  console.error('\n❌ Build/QA failed');
  process.exit(1);
}
