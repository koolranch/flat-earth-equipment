import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('Module 1 PPE + Controls flows', async ({ page }) => {
  await page.goto(`${BASE}/training/module-1`);
  await expect(page.getByRole('heading', { name: /Pre-Operation/i })).toBeVisible();
  // PPE sequence: click 4 cards in order
  const nextHints = ['Hi-vis vest', 'Hard hat', 'Set brake', 'Lower forks'];
  for (const hint of nextHints) {
    await page.getByRole('button', { name: new RegExp(hint, 'i') }).click();
  }
  await expect(page.getByText(/Sequence complete/i)).toBeVisible();
  // Controls identify: click 4 hotspots
  const hotspots = ['Steering wheel','Horn button','Ignition','Parking brake'];
  for (const h of hotspots) {
    await page.getByRole('button', { name: new RegExp(h, 'i') }).click();
  }
  await expect(page.getByText(/All controls identified/i)).toBeVisible();
  // Quiz should now be unlocked
  await expect(page.getByRole('button', { name: /Start Quiz/i })).toBeEnabled();
});
