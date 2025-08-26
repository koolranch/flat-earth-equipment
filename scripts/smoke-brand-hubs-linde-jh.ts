import 'dotenv/config';
import fetch from 'node-fetch';

const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000').replace(/\/$/, '');
const slugs = ['linde', 'jungheinrich'];

async function check(path: string) {
  const res = await fetch(`${ORIGIN}${path}`, { redirect: 'manual' });
  console.log(res.status, path);
  if (res.status >= 400) throw new Error(`Bad status for ${path}`);
}

(async () => {
  for (const s of slugs) {
    await check(`/brand/${s}`);
    await check(`/brand/${s}/serial-lookup`);
    await check(`/brand/${s}/fault-codes`);
    await check(`/brand/${s}/guide`);
    await check(`/es/brand/${s}/serial-lookup`);
  }
  console.log('Smoke OK for linde/jungheinrich');
})().catch(e => {
  console.error(e);
  process.exit(1);
});
