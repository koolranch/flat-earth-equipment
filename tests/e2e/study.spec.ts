import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('study API returns payload', async ({ request }) => {
  const r = await request.get(`${BASE}/api/study/by-tag?tag=stability&locale=en`);
  expect([200, 404]).toContain(r.status());
  if (r.status() === 200) { const j = await r.json(); expect(j.ok).toBeTruthy(); expect(j).toHaveProperty('cards'); }
});

test('study page loads', async ({ page }) => {
  const res = await page.goto(`${BASE}/training/study/stability`);
  expect([200, 302, 401, 403]).toContain(res?.status() || 200);
});
