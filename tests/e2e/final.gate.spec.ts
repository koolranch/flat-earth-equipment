import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

// This test simulates local completion to avoid depending on API state

test('Final gate locks then unlocks', async ({ page }) => {
  await page.goto(`${BASE}/training/final`);
  await expect(page.getByText(/Complete all module quizzes/i)).toBeVisible();

  // Inject local completion for modules 1–5
  await page.evaluate(() => {
    const state = { module_1:{quiz:{passed:true}}, module_2:{quiz:{passed:true}}, module_3:{quiz:{passed:true}}, module_4:{quiz:{passed:true}}, module_5:{quiz:{passed:true}} };
    localStorage.setItem('training:progress:v1', JSON.stringify(state));
  });
  await page.reload();
  await expect(page.getByRole('link', { name: /Start Final Exam/i })).toBeVisible();
});
