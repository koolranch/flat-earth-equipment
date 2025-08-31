import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('Verify page — invalid code', async ({ page }) => {
  await page.goto(`${BASE}/verify/NOTAREALCODE`);
  await expect(page.getByText(/Invalid or not found/i)).toBeVisible();
});

// Optional: gated by env to avoid flakiness in CI
const needsDynamicEnroll = !process.env.E2E_ENROLLMENT_ID && process.env.ADMIN_EXPORT_TOKEN && process.env.TEST_USER_EMAIL;
test('Issue cert + verify — happy path', async ({ page }) => {
  test.skip(!needsDynamicEnroll && !process.env.E2E_ENROLLMENT_ID, 'needs E2E_ENROLLMENT_ID or dev helper');
  
  let enr = process.env.E2E_ENROLLMENT_ID;
  if (!enr && process.env.ADMIN_EXPORT_TOKEN && process.env.TEST_USER_EMAIL && process.env.NODE_ENV !== 'production') {
    const r = await page.request.get(`${BASE}/api/dev/latest-passed-enrollment?email=${encodeURIComponent(process.env.TEST_USER_EMAIL)}`, {
      headers: { 'X-Admin-Token': process.env.ADMIN_EXPORT_TOKEN }
    });
    const j = await r.json();
    if (!j.ok) throw new Error('No passed enrollment found for test user');
    enr = j.enrollment_id;
  }
  const res = await page.request.post(`${BASE}/api/cert/issue`, {
    data: { enrollment_id: enr }
  });
  expect(res.ok()).toBeTruthy();
  const j = await res.json();
  expect(j.ok).toBeTruthy();
  await page.goto(`${BASE}/verify/${j.verification_code}`);
  await expect(page.getByText(/VALID/i)).toBeVisible();
});
