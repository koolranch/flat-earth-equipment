import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ENV_PATH = resolve(process.cwd(), '.env.local');
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
}));

function upsert(lines, key, val){
  if (val === undefined || val === null) return lines;
  const kv = `${key}=${val}`;
  const idx = lines.findIndex(l => l.trim().startsWith(key + '='));
  if (idx === -1) lines.push(kv); else lines[idx] = kv; return lines;
}

function writeEnv(values){
  let lines = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8').split(/\r?\n/) : [];
  if (lines.length && lines[lines.length-1] !== '') lines.push('');
  lines = upsert(lines, 'SENTRY_DSN', values.dsn);
  if (values.public === '1' || values.public === true) {
    lines = upsert(lines, 'NEXT_PUBLIC_SENTRY_DSN', values.dsn);
  }
  if (values.org) lines = upsert(lines, 'SENTRY_ORG', values.org);
  if (values.project) lines = upsert(lines, 'SENTRY_PROJECT', values.project);
  if (values.environment) lines = upsert(lines, 'SENTRY_ENVIRONMENT', values.environment);
  if (values.traces) lines = upsert(lines, 'SENTRY_TRACES_SAMPLE_RATE', values.traces);
  if (values.replays !== undefined) lines = upsert(lines, 'SENTRY_REPLAYS_SAMPLE_RATE', values.replays);
  if (values.logs !== undefined) lines = upsert(lines, 'SENTRY_ENABLE_LOGS', values.logs);
  const out = lines.join('\n').replace(/\n+$/,'') + '\n';
  writeFileSync(ENV_PATH, out, 'utf8');
}

function ensureGitignore(){
  const p = resolve(process.cwd(), '.gitignore');
  if (!existsSync(p)) return;
  const txt = readFileSync(p, 'utf8');
  if (!/\n?\.env\.local\n?/.test(txt)) appendFileSync(p, '\n.env.local\n');
}

function banner(values){
  const hr = '='.repeat(64);
  console.log(`\n${hr}\nSentry envs written to .env.local\n${hr}`);
  console.table({
    SENTRY_DSN: (values.dsn||'').slice(0, 32) + '…',
    NEXT_PUBLIC_SENTRY_DSN: (values.public==='1'?'(same as DSN)':'(not set)'),
    SENTRY_ORG: values.org||'(unset)',
    SENTRY_PROJECT: values.project||'(unset)',
    SENTRY_ENVIRONMENT: values.environment||'(unset)',
    SENTRY_TRACES_SAMPLE_RATE: values.traces||'(unset)',
    SENTRY_REPLAYS_SAMPLE_RATE: values.replays||'(unset)',
    SENTRY_ENABLE_LOGS: values.logs||'(unset)'
  });
  console.log('\nReminder: add the same (server) vars in Vercel for production builds.');
}

// ---- main ----
if (!args.dsn){
  console.error('Missing required --dsn=…');
  process.exit(2);
}
const values = {
  dsn: args.dsn,
  public: args.public ?? '0',
  org: args.org,
  project: args.project,
  environment: args.env || args.environment || 'development',
  traces: args.traces || '0.1',
  replays: args.replays || '0',
  logs: args.logs || '0'
};
writeEnv(values);
ensureGitignore();
banner(values);
