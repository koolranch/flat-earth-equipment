/* Simple smoke test against BASE_URL/api/health */
const base = process.env.BASE_URL || 'http://localhost:3000';
const url = base.replace(/\/$/, '') + '/api/health';
console.log('[prod-smoke] →', url);
const r = await fetch(url, { cache: 'no-store' });
if (!r.ok) {
  console.error('[prod-smoke] HTTP', r.status);
  process.exit(1);
}
const j = await r.json();
console.log('[prod-smoke] result:', JSON.stringify(j, null, 2));
if (!j.ok) process.exit(2);
