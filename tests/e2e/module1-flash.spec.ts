import { test, expect } from '@playwright/test';
test('Module 1 has flash cards and OSHA tab', async ({ page }) => {
  await page.goto('/training/forklift-operator/module-1/pre-operation');
  await page.getByRole('tab', { name: /flash cards/i }).click();
  await expect(page.getByRole('button', { name: /flash-card/i })).toBeVisible();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: /next/i }).click();
  await page.getByRole('tab', { name: /osha basics/i }).click();
  await expect(page.getByText(/OSHA 1910.178/i)).toBeVisible();
});
