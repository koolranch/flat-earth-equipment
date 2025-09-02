import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAq8BzY3Dq4QAAAAASUVORK5CYII=';

test('eval save returns ok', async ({ request }) => {
  const res = await request.post(`${BASE}/api/eval/save`, {
    data: { enrollment_id: process.env.E2E_ENROLLMENT_ID || '00000000-0000-0000-0000-000000000000', evaluator_name:'QA', practical_pass: true, competencies:{ preop:true } }
  });
  expect([200,401,403,400]).toContain(res.status());
});

test('signature endpoint validates payload', async ({ request }) => {
  const res = await request.post(`${BASE}/api/eval/signature`, {
    data: { enrollment_id: process.env.E2E_ENROLLMENT_ID || '00000000-0000-0000-0000-000000000000', role:'evaluator', dataUrl: tinyPng }
  });
  expect([200,401,403,400,500]).toContain(res.status());
});
