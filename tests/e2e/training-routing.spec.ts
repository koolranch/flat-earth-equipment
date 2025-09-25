import { test, expect } from '@playwright/test';

test('Start buttons link by DB order', async ({ page }) => {
  await page.goto('/training?courseId=forklift');
  // First Start should point to module/1
  const first = page.getByRole('link', { name: /start/i }).first();
  await expect(first).toHaveAttribute('href', /\/training\/module\/1\?courseId=forklift/);
});
