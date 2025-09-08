import { setTimeout as wait } from 'node:timers/promises';
import { request } from 'undici';

const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const REQUIRED_ENVS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SENTRY_DSN',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET'
];

function log(ok, msg){
  const mark = ok ? '✅' : '❌';
  console.log(`${mark} ${msg}`);
}

async function check(url, expect = 200){
  const { statusCode } = await request(url, { method: 'GET' });
  return statusCode === expect;
}

(async () => {
  let fail = false;
  console.log(`\nGo-Live Audit for ${BASE_URL}\n`);

  // 1) Env sanity
  for (const k of REQUIRED_ENVS){
    const ok = !!process.env[k];
    log(ok, `ENV ${k} present`);
    if(!ok) fail = true;
  }

  // 2) Key routes
  const routes = [
    ['Homepage', `${BASE_URL}/`, 200],
    ['Training Hub', `${BASE_URL}/training`, 200],
    ['Records', `${BASE_URL}/records`, 200],
    ['Sitemap', `${BASE_URL}/sitemap.xml`, 200],
    ['Robots', `${BASE_URL}/robots.txt`, 200]
  ];
  for (const [name, url, code] of routes){
    try { const ok = await check(url, code); log(ok, `${name} ${ok ? 'OK' : 'FAILED'} (${url})`); if(!ok) fail = true; }
    catch { log(false, `${name} error (${url})`); fail = true; }
  }

  // 3) Verify page (expect 404 on junk code)
  try {
    const ok = await check(`${BASE_URL}/verify/NOTREALCODE`, 404);
    log(ok, 'Verify page returns 404 for invalid code');
    if(!ok) fail = true;
  } catch { log(false, 'Verify page check error'); fail = true; }

  // 4) Storage: try a public asset that should exist (SVG, PDF, or logo)
  const assets = [
    `${BASE_URL}/icons/ppe.svg`,
    `${BASE_URL}/images/ui/logo.svg`
  ];
  for (const a of assets){
    try { const ok = await check(a, 200); log(ok, `Asset reachable: ${a}`); } catch { /* ignore */ }
  }

  // 5) Stripe webhook endpoint (OPTIONS 200/204 or GET 405 is acceptable, we just want route mounted)
  try {
    const { statusCode } = await request(`${BASE_URL}/api/webhooks/stripe`, { method: 'OPTIONS' });
    log([200,204,405].includes(statusCode), 'Stripe webhook route mounted');
  } catch { log(false, 'Stripe webhook route not reachable'); }

  // 6) Sentry DSN format
  const dsnOk = /^https?:\/\/.+@.+\.ingest\..+\/\d+/.test(process.env.SENTRY_DSN || '');
  log(dsnOk, 'Sentry DSN looks valid');
  if(!dsnOk) fail = true;

  await wait(50);
  console.log(`\n${fail ? '❌ Issues found. See logs above.' : '✅ Go-Live Audit passed.'}`);
  process.exit(fail ? 1 : 0);
})();
