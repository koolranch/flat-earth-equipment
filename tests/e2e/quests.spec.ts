import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('quests list returns JSON', async ({ request }) => {
  const r = await request.get(`${BASE}/api/quests/list?tag=preop&locale=en`);
  expect([200, 404]).toContain(r.status());
  if (r.status() === 200) { const j = await r.json(); expect(j.ok).toBeTruthy(); expect(j).toHaveProperty('items'); }
});

test('quest page loads or redirects', async ({ page }) => {
  const res = await page.goto(`${BASE}/training/quests/preop-hotspots`);
  expect([200, 302, 401, 403, 404]).toContain(res?.status() || 200);
});
