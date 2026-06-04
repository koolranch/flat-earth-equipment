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

// Regression: enterprise/trainer endpoints must not return another org's data
// to a caller who is not an authorized member. Anonymous callers must never
// receive a 200 with data, regardless of any caller-supplied org_id.
const ARBITRARY_ORG_ID = '00000000-0000-0000-0000-000000000001';

test('trainer csv-less export requires auth (no anonymous PII dump)', async ({ request }) => {
  const r = await request.get(`${BASE}/api/trainer/export?course_id=00000000-0000-0000-0000-000000000002`);
  expect([401,403]).toContain(r.status());
});

test('enterprise analytics requires auth even with org_id supplied', async ({ request }) => {
  const r = await request.get(`${BASE}/api/enterprise/analytics?org_id=${ARBITRARY_ORG_ID}`);
  expect([401,403]).toContain(r.status());
});

test('enterprise analytics export (POST) requires auth even with org_id supplied', async ({ request }) => {
  const r = await request.post(`${BASE}/api/enterprise/analytics`, {
    data: { org_id: ARBITRARY_ORG_ID, format: 'json' },
  });
  expect([401,403]).toContain(r.status());
});

test('enterprise executive analytics is not anonymously accessible', async ({ request }) => {
  const r = await request.get(`${BASE}/api/enterprise/analytics?view=executive`);
  expect([401,403]).toContain(r.status());
});

test('enterprise bulk export requires auth even with org_id supplied', async ({ request }) => {
  const r = await request.get(`${BASE}/api/enterprise/bulk?action=export&type=users&org_id=${ARBITRARY_ORG_ID}`);
  expect([401,403]).toContain(r.status());
});

// Presence only — we expect 400 without attempt_id
test('quest complete endpoint exists', async ({ request }) => {
  const r = await request.post(`${BASE}/api/quests/attempt/complete`, { data: {} });
  expect([400,401,403]).toContain(r.status());
});
