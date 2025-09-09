import { test, expect } from '@playwright/test';

test('Training page renders even if progress API fails', async ({ page }) => {
  await page.route('**/api/training/progress**', route => route.fulfill({ status: 500, body: 'boom' }));
  await page.goto('/training?courseId=forklift_operator');
  await expect(page.getByRole('heading', { name: /Forklift Operator Training/i })).toBeVisible();
  // Should not show "Failed to load progress" error
  await expect(page.getByText('Failed to load progress')).not.toBeVisible();
});
