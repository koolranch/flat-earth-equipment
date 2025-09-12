import { test, expect } from '@playwright/test';

test('OSHA Basics card renders consistently across modules', async ({ page }) => {
  const modules = [1,2,3,4,5];
  for (const n of modules) {
    await page.goto(`/training/forklift_operator/module-${n}?tab=osha`);
    await expect(page.getByTestId(`osha-m${n}`)).toBeVisible();
    await page.getByRole('button', { name: /continue/i }).click();
  }
});
