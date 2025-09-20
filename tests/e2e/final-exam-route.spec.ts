import { test, expect } from '@playwright/test';

test('final exam page loads (enrolled user)', async ({ page }) => {
  await page.goto('/training/exam');
  await expect(page.getByText(/Final Exam/i)).toBeVisible();
});
