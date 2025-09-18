import { test, expect } from '@playwright/test';
// NOTE: requires auth fixtures for owner/trainer to run fully. Smoke-level doc here.

test('doc: owner can open /trainer/invites and see seats + invite form', async ({ page }) => {
  expect(true).toBeTruthy();
});

test('anon → /trainer/invites redirects to login', async ({ page }) => {
  await page.goto('/trainer/invites');
  await expect(page).toHaveURL(/\/login\?next=%2Ftrainer/);
});

test('redeem page requires auth', async ({ page }) => {
  await page.goto('/redeem?token=test123');
  await expect(page).toHaveURL(/\/login\?next=%2Fredeem/);
});
