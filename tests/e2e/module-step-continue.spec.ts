import { test, expect } from '@playwright/test';

test('OSHA tab shows continue and advances to Practice', async ({ page }) => {
  await page.goto('/training/forklift-operator/module-2');
  await expect(page.getByTestId('step-continue-osha')).toBeVisible();
  await page.getByTestId('step-continue-osha').click();
  await expect(page.getByRole('tab', { name: /Practice/i })).toHaveAttribute('aria-selected', 'true');
});
