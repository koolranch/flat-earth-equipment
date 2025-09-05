import { execSync } from 'node:child_process';
import fetch from 'node-fetch';

const BASE = process.env.BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const required = ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY'];
const optional = ['RESEND_API_KEY','SENTRY_DSN','CRON_SECRET','ADMIN_EXPORT_TOKEN','NEXT_PUBLIC_SUPPORTED_LOCALES'];

function has(k){ return !!process.env[k]; }
function banner(t){ console.log(`\n\u001b[1m${t}\u001b[0m`); }

(async()=>{
  banner('Env check');
  const missing = required.filter(k=> !has(k));
  console.table({ required_ok: missing.length===0, missing: missing.join(', ')||'none' });
  if (missing.length){ console.error('Missing required env'); process.exit(2); }

  banner('Health & version');
  try {
    const h = await fetch(`${BASE}/api/health`, { cache:'no-store' });
    const hv = await h.json();
    console.log('health:', h.status, hv);
    const v = await fetch(`${BASE}/api/version`);
    console.log('version:', await v.json());
    if (!hv.ok) throw new Error('health not ok');
  } catch(e){ console.error('Health/version failed:', e?.message||e); process.exit(3); }

  banner('QA bundles');
  try { execSync('npm run qa:security', { stdio:'inherit' }); } catch { process.exit(4); }
  try { execSync('npm run qa:i18n-a11y', { stdio:'inherit' }); } catch { process.exit(5); }
  try { execSync('npm run qa:seats', { stdio:'inherit' }); } catch { process.exit(6); }

  banner('DONE');
  console.log('✅ Preflight PASS');
})();
