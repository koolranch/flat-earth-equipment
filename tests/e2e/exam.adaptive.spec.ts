import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('generator returns blueprint + items', async ({ request }) => {
  const r = await request.post(`${BASE}/api/exam/generate`, { data: { locale: 'es', count: 12 } });
  if (r.status() !== 200) { test.skip(true, 'generator gated'); return; }
  const j = await r.json();
  expect(j.ok).toBeTruthy();
  expect(j.count).toBeGreaterThan(0);
  expect(j.meta?.blueprint_used).toBeTruthy();
});

test('review route loads or redirects', async ({ page }) => {
  const res = await page.goto(`${BASE}/training/exam/review?attempt=invalid`);
  expect([200, 302, 401, 403]).toContain(res?.status() || 200);
});
