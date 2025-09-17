import { test, expect } from '@playwright/test';

test('anon user → Safety Get Started → login with next', async ({ page }) => {
  await page.goto('/safety');
  await page.getByTestId('get-started-cta').click();
  await expect(page).toHaveURL(/\/login\?next=%2Ftraining/);
});
