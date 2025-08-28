import { execSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';

// Parse CLI args: --base-url= --learner= --course=
const args = Object.fromEntries(process.argv.slice(2).map((kv) => {
  const [k, v] = kv.split('=');
  return [k.replace(/^--/, ''), v ?? ''];
}));

const BASE_URL = args['base-url'] || process.env.BASE_URL || 'http://localhost:3000';
const LEARNER_ID = args['learner'] || process.env.LEARNER_ID || '';
const COURSE_ID  = args['course']  || process.env.COURSE_ID  || '';

function isLocal(url) {
  return /^(https?:\/\/)(localhost|127\.0\.0\.1)(:|\/|$)/i.test(url);
}

async function requireLocalServer(url) {
  if (!isLocal(url)) return; // not local — skip check
  const ok = await new Promise((res) => {
    const req = http.get(url, (r) => { r.resume(); res(true); });
    req.on('error', () => res(false));
    req.setTimeout(2500, () => { try { req.destroy(); } catch {} res(false); });
  });
  if (!ok) {
    console.error(`\n❌ Local server not reachable at ${url}. Start it first: \n   npm start\n`);
    process.exit(1);
  }
}

(async () => {
  console.log('\n▶ qa:cert runner');
  console.log('   BASE_URL   =', BASE_URL);
  if (!LEARNER_ID || !COURSE_ID) {
    console.log('   ℹ️  LEARNER_ID/COURSE_ID not set — cert E2E may skip or fail depending on your script.');
    console.log('   Pass them with --learner=<uuid> --course=<uuid>');
  }

  // Check that the underlying E2E script exists
  const SCRIPT = 'scripts/e2e_cert_verify.mjs';
  if (!fs.existsSync(SCRIPT)) {
    console.error(`\n❌ Missing ${SCRIPT}. Create it or update qa:cert to your actual cert E2E script.`);
    process.exit(1);
  }

  // If targeting local, ensure server is up
  await requireLocalServer(BASE_URL);

  // Delegate to the underlying E2E script with forwarded env
  try {
    execSync(`node ${SCRIPT}`, {
      stdio: 'inherit',
      env: { ...process.env, BASE_URL, LEARNER_ID, COURSE_ID }
    });
    console.log('\n✅ qa:cert complete');
  } catch (e) {
    console.error('\n❌ qa:cert failed');
    process.exit(1);
  }
})();
