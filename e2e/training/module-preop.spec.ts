import { test, expect } from '@playwright/test';

test('Module 1 renders and unlocks quiz after demo', async ({ page }) => {
  await page.goto('/training/modules/preop');
  await expect(page.getByRole('heading', { name: /Pre-Operation Inspection/i })).toBeVisible();
  
  // Complete the PPE sequence
  await page.getByText('Put on safety vest').click();
  await page.getByText('Put on hard hat').click();
  await page.getByText('Fasten seatbelt').click();
  
  // Quiz should be unlocked
  const startQuiz = page.getByRole('button', { name: /Start quiz/i });
  await expect(startQuiz).toBeEnabled();
});
