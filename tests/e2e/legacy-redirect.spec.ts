import { test, expect } from '@playwright/test';

test('/training/modules/anything redirects to /training', async ({ page }) => {
  await page.goto('/training/modules/anything');
  await expect(page).toHaveURL('/training');
});

test('/training/modules/pre-op redirects to /training', async ({ page }) => {
  await page.goto('/training/modules/pre-op');
  await expect(page).toHaveURL('/training');
});

test('/training/modules/some-other-slug redirects to /training', async ({ page }) => {
  await page.goto('/training/modules/some-other-slug');
  await expect(page).toHaveURL('/training');
});
