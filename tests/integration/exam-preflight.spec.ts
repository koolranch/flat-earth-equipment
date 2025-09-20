import { test, expect } from '@playwright/test';

test('debug page gated by flag', async ({ page }) => {
  await page.goto('/debug/exam');
  await expect(page.getByText(/Debug is disabled\./)).toBeVisible();
});
