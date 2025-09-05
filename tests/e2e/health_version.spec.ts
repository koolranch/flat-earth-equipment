import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('/api/health responds with ok/checks', async ({ request }) => {
  const r = await request.get(`${BASE}/api/health`, { headers: { 'cache-control':'no-store' } });
  expect([200,503]).toContain(r.status());
  const j = await r.json();
  expect(j).toHaveProperty('checks');
});

test('/api/version responds with sha', async ({ request }) => {
  const r = await request.get(`${BASE}/api/version`);
  expect(r.status()).toBe(200);
  const j = await r.json();
  expect(j).toHaveProperty('sha');
});
