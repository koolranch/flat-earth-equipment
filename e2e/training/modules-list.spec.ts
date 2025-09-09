import { test, expect } from '@playwright/test';

test('Modules list renders with fallback', async ({ page }) => {
  await page.route('**/api/**modules**', r => r.fulfill({ status: 500, body: 'err' }));
  await page.goto('/training?courseId=forklift_operator');
  await expect(page.getByRole('heading', { name: /Forklift Operator Training/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Module 1: Pre-Operation Inspection/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Module 4: Hazard Hunt/i })).toBeVisible();
});
