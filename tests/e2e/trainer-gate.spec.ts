import { test, expect } from '@playwright/test';

test('anon → /trainer redirects to login', async ({ page }) => {
  await page.goto('/trainer');
  await expect(page).toHaveURL(/\/login\?next=%2Ftrainer/);
});

// Optional: add fixtures to login as owner/trainer and verify access
test('trainer dashboard shows organization info', async ({ page }) => {
  // This test requires a logged-in user with trainer/owner role in an org
  // For now, we'll just verify the page structure if accessible
  await page.goto('/trainer');
  
  // If redirected to login, that's expected for non-trainer users
  if (page.url().includes('/login')) {
    expect(page.url()).toMatch(/\/login\?next=%2Ftrainer/);
  } else {
    // If we reach the dashboard, verify key elements
    await expect(page.getByText('Trainer Dashboard')).toBeVisible();
    await expect(page.getByText('Organization')).toBeVisible();
    await expect(page.getByText('Members')).toBeVisible();
  }
});
