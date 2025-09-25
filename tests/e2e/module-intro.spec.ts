import { test, expect } from '@playwright/test';

test('order=1 renders Introduction title, not Module 1', async ({ page }) => {
  await page.goto('/training/module/1?courseId=forklift');
  await expect(page.getByRole('heading', { name: /Introduction/i })).toBeVisible();
});
