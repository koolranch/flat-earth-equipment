import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('backup-now requires auth', async ({ request }) => {
  const r = await request.post(`${BASE}/api/admin/backup-now`);
  expect([401,403]).toContain(r.status());
});

test('trainer export requires auth', async ({ request }) => {
  const r = await request.get(`${BASE}/api/trainer/export.csv`);
  expect([401,403]).toContain(r.status());
});

// Presence only — we expect 400 without attempt_id
test('quest complete endpoint exists', async ({ request }) => {
  const r = await request.post(`${BASE}/api/quests/attempt/complete`, { data: {} });
  expect([400,401,403]).toContain(r.status());
});
