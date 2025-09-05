import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('orders API requires auth', async ({ request }) => {
  const r = await request.get(`${BASE}/api/trainer/orders`);
  expect([401, 403]).toContain(r.status());
});

test('trainer seats page reachable (may redirect)', async ({ page }) => {
  const res = await page.goto(`${BASE}/trainer/seats`);
  expect([200, 302, 401, 403]).toContain(res?.status() || 200);
});

test('recert eligibility requires auth', async ({ request }) => {
  const r = await request.get(`${BASE}/api/recert/eligibility`);
  expect([401, 403]).toContain(r.status());
});

// Hub banner is session-dependent; we only check page loads
test('training hub loads', async ({ page }) => {
  const res = await page.goto(`${BASE}/training`);
  expect([200, 302]).toContain(res?.status() || 200);
});
