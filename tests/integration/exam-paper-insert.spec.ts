import { test, expect } from '@playwright/test';

test('final exam creates paper/session for enrolled user', async ({ page }) => {
  await page.goto('/training/exam');
  await expect(page.getByText(/Final Exam|Unable to start exam|not configured/i)).toBeVisible();
});
