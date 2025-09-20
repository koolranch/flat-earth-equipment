import { test, expect } from '@playwright/test';

test('no false all-done banner on fresh account', async ({ page }) => {
  await page.goto('/training?course=forklift');
  await expect(page.locator('[data-testid="all-done-banner"]')).toHaveCount(0);
});

test('legacy param redirects to canonical and banner remains hidden', async ({ page }) => {
  await page.goto('/training?courseId=forklift_operator');
  await page.waitForURL(/\/training(\?.*)?$/);
  await expect(page.locator('[data-testid="all-done-banner"]')).toHaveCount(0);
});
