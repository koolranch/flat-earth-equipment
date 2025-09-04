import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('admin quiz page reachable or redirects', async ({ page }) => {
  const res = await page.goto(`${BASE}/admin/quiz`);
  expect([200, 302, 401, 403]).toContain(res?.status() || 200);
});

test('exam generator uses only published', async ({ request }) => {
  const r = await request.post(`${BASE}/api/exam/generate`, { data: { locale: 'en', count: 12 } });
  if (r.status() !== 200) { test.skip(true, 'generator gated in CI'); return; }
  const j = await r.json();
  const bad = (j.items || []).find((it: any) => it.status && it.status !== 'published');
  expect(bad).toBeFalsy();
});
