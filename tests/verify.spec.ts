import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CODE = process.env.E2E_VERIFY_CODE;

test.skip(!CODE, 'Set E2E_VERIFY_CODE to run verify page test');

test('verify page shows status and learner name', async ({ page }) => {
  await page.goto(`${BASE_URL}/verify/${CODE}`);
  await expect(page.getByRole('heading', { name: 'Certificate Verification' })).toBeVisible();
  await expect(page.getByText(/Status/i)).toBeVisible();
  await expect(page.getByText(/Verify Code/i)).toBeVisible();
});
