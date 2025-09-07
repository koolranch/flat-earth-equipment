import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('Module 2 8-Point Inspection', async ({ page }) => {
  await page.goto(`${BASE}/training/module-2`);
  await expect(page.getByRole('heading', { name: /Daily Inspection/i })).toBeVisible();
  const picks = ['Tires','Forks','Chains','Horn','Lights','Hydraulics','Leaks','Data plate'];
  for (const p of picks) {
    await page.getByRole('button', { name: new RegExp(p, 'i') }).click();
  }
  await expect(page.getByText(/Inspection complete/i)).toBeVisible();
  // Quiz should now be unlocked
  await expect(page.getByRole('button', { name: /Start Quiz/i })).toBeEnabled();
});
