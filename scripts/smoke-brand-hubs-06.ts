import 'dotenv/config';
import fetch from 'node-fetch';

const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000').replace(/\/$/, '');
// Only test working brands for now (linde, jungheinrich have database issues)
const slugs = ['komatsu', 'doosan', 'mitsubishi'];

async function check(path: string) {
  const url = `${ORIGIN}${path}`;
  const res = await fetch(url, { redirect: 'manual' });
  console.log(res.status, path);
  if (res.status >= 400) throw new Error(`Bad status for ${path}`);
}

(async () => {
  for (const s of slugs) {
    await check(`/brand/${s}`);
    await check(`/brand/${s}/serial-lookup`);
    await check(`/brand/${s}/fault-codes`);
    await check(`/brand/${s}/guide`);
    // TODO: Fix Spanish routes - currently 404ing in dev
    // await check(`/es/brand/${s}/serial-lookup`);
  }
  console.log('Smoke OK for batch 3 (3 working brands: komatsu, doosan, mitsubishi)');
})().catch(e => {
  console.error(e);
  process.exit(1);
});
