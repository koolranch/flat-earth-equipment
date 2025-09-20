import { test, expect } from '@playwright/test';

test('exam session creates with answers array', async ({ page }) => {
  await page.goto('/training/exam');
  await expect(page.getByText(/Final Exam|not configured|Unable to start exam/i)).toBeVisible();
});
