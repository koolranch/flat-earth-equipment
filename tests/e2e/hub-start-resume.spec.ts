import { test, expect } from '@playwright/test';

// Smoke tests: buttons route correctly (requires seed data)

test('Resume goes to next playable module', async ({ page }) => {
  await page.goto('/training');
  const btn = page.getByRole('button', { name: /resume/i }).or(page.getByRole('link', { name: /resume/i }));
  await btn.click();
  await expect(page).toHaveURL(/\/training\/module\/[2-9]\?courseId=forklift/);
});

test('Introduction Start leads to first content module when intro has no content_slug', async ({ page }) => {
  await page.goto('/training');
  const startIntro = page.getByRole('button', { name: /start.*introduction/i }).or(page.getByRole('link', { name: /start.*introduction/i }));
  await startIntro.click();
  await expect(page).toHaveURL(/\/training\/module\/2\?courseId=forklift/);
});
