import { test, expect } from '@playwright/test';

test('training hub has no prelaunch banners', async ({ page }) => {
  await page.goto('/training');
  // The banners should not be present by default
  await expect(page.getByText('Pre-launch preview', { exact: false })).toHaveCount(0);
  await expect(page.getByText('Training preview is available', { exact: false })).toHaveCount(0);
});
