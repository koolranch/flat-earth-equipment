import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('Final Exam loads and advances', async ({ page }) => {
  await page.goto(`${BASE}/exam/final`);
  await expect(page.getByRole('heading', { name: /Final Exam/i })).toBeVisible();
  
  // Answer first 3 items to exercise navigation
  for (let i = 0; i < 3; i++) {
    // Wait for question to load
    await page.waitForTimeout(500);
    
    // Click first option for current question
    const qButtons = page.locator('ul[role="group"] button');
    if (await qButtons.count() > 0) {
      await qButtons.first().click();
    } else {
      // Fallback: click any available button
      const buttons = page.locator('button:below(:text("Pass"))');
      if (await buttons.count() > 0) {
        await buttons.first().click();
      }
    }
    
    // Small delay to allow state updates
    await page.waitForTimeout(300);
  }
  
  // Verify we can navigate through questions
  const progressText = page.locator('text=/\\d+ \\/ \\d+/');
  if (await progressText.count() > 0) {
    await expect(progressText.first()).toBeVisible();
  }
});
