import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('roster requires auth', async ({ request }) => {
  const r = await request.get(`${BASE}/api/trainer/roster`);
  expect([401, 403]).toContain(r.status());
});

test('dashboard page reachable (may redirect)', async ({ page }) => {
  const res = await page.goto(`${BASE}/trainer/dashboard`);
  expect([200, 302, 401, 403]).toContain(res?.status() || 200);
});

test('CSV endpoint requires auth', async ({ request }) => {
  const r = await request.get(`${BASE}/api/trainer/export.csv`);
  expect([401, 403]).toContain(r.status());
});
