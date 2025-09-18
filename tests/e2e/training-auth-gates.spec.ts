import { test, expect } from '@playwright/test';

test('anon visiting /training is redirected to login with next', async ({ page }) => {
  await page.goto('/training');
  await expect(page).toHaveURL(/\/login\?next=%2Ftraining/);
});

test('anon on /safety uses CTA to login with next', async ({ page }) => {
  await page.goto('/safety');
  await page.getByTestId('get-started-cta').click();
  await expect(page).toHaveURL(/\/login\?next=%2Ftraining/);
});

// Test that training hub also requires auth
test('anon visiting /training/hub is redirected to login', async ({ page }) => {
  await page.goto('/training/hub');
  await expect(page).toHaveURL(/\/login\?next=%2Ftraining/);
});

// Test that individual modules require auth
test('anon visiting /training/module/1 is redirected to login', async ({ page }) => {
  await page.goto('/training/module/1');
  await expect(page).toHaveURL(/\/login\?next=%2Ftraining/);
});

// (Optional) If you have fixtures to sign in without enrollment, test redirect to checkout
// test('authed but not enrolled → /training redirects to /training/checkout', async ({ page }) => { /* ... */ });
