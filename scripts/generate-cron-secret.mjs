import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ENV_PATH = resolve(process.cwd(), '.env.local');
const ROTATE = process.argv.includes('--rotate') || process.argv.includes('-r');

function genSecret() {
  return randomBytes(32).toString('hex'); // 64 hex chars
}

function loadEnvLines() {
  if (!existsSync(ENV_PATH)) return [];
  try { return readFileSync(ENV_PATH, 'utf8').split(/\r?\n/); } catch { return []; }
}

function saveEnvLines(lines) {
  const content = lines.join('\n').trimEnd() + '\n';
  writeFileSync(ENV_PATH, content, 'utf8');
}

function getCurrentSecret(lines) {
  const line = lines.find(l => /^\s*CRON_SECRET\s*=/.test(l));
  if (!line) return null;
  const m = line.match(/^\s*CRON_SECRET\s*=\s*(.*)$/);
  return m ? m[1].trim() : null;
}

function setSecret(lines, secret) {
  const idx = lines.findIndex(l => /^\s*CRON_SECRET\s*=/.test(l));
  if (idx === -1) lines.push(`CRON_SECRET=${secret}`);
  else lines[idx] = `CRON_SECRET=${secret}`;
  return lines;
}

function printBanner(secret, rotated) {
  const hr = '='.repeat(64);
  console.log(`\n${hr}`);
  console.log('CRON_SECRET generated');
  console.log(hr);
  console.log('\nAdd this to Vercel → Project → Settings → Environment Variables');
  console.log('Key: CRON_SECRET');
  console.log(`Value: ${secret}`);
  console.log('\nLocal file updated: .env.local');
  console.log(rotated ? 'Rotation: NEW secret written (old value replaced).\n' : 'Rotation: existing value kept (use --rotate to force a new one).\n');
  console.log('Example header for your cron calls:');
  console.log(`  x-cron-secret: ${secret}`);
  console.log('\nExample curl:');
  console.log('  curl -X POST https://YOUR_DOMAIN/api/cron/some-task \\');
  console.log(`       -H "x-cron-secret: ${secret}"`);
  console.log(`\n${hr}\n`);
}

(function main(){
  let lines = loadEnvLines();
  const current = getCurrentSecret(lines);

  if (current && !ROTATE) {
    // Keep existing and print
    printBanner(current, false);
    return;
  }

  const next = genSecret();
  lines = setSecret(lines.length ? lines : [''], next);
  saveEnvLines(lines);
  printBanner(next, !!current);
})();
