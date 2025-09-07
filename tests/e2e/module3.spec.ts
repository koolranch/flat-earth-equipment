import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('Module 3 Stability Playground', async ({ page }) => {
  await page.goto(`${BASE}/training/module-3`);
  await expect(page.getByRole('heading', { name: /Balance & Load/i })).toBeVisible();
  // Drag sliders by setting values via JS for stability
  await page.locator('input[type="range"]').first().evaluate((el: HTMLInputElement) => { el.value = '1000'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('input[type="range"]').nth(1).evaluate((el: HTMLInputElement) => { el.value = '8'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await expect(page.getByText(/tip risk/i)).toBeVisible();
  // Quiz should now be unlocked after interaction
  await expect(page.getByRole('button', { name: /Start Quiz/i })).toBeEnabled();
});
