import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('Verify page — invalid code', async ({ page }) => {
  await page.goto(`${BASE}/verify/NOTAREALCODE`);
  await expect(page.getByText(/Invalid or not found/i)).toBeVisible();
});

// Optional: gated by env to avoid flakiness in CI
test('Issue cert + verify — happy path', async ({ page }) => {
  test.skip(!process.env.E2E_ENROLLMENT_ID, 'needs E2E_ENROLLMENT_ID');
  
  const enr = process.env.E2E_ENROLLMENT_ID!;
  const res = await page.request.post(`${BASE}/api/cert/issue`, {
    data: { enrollment_id: enr }
  });
  expect(res.ok()).toBeTruthy();
  const j = await res.json();
  expect(j.ok).toBeTruthy();
  await page.goto(`${BASE}/verify/${j.verification_code}`);
  await expect(page.getByText(/VALID/i)).toBeVisible();
});
