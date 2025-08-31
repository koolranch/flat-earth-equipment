import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function makeStable(page) {
  await page.getByRole('button', { name: /Start demo/i }).click();
  // tweak sliders towards a stable zone
  await page.locator('input#t').fill('5'); // slight back tilt
  await page.locator('input#w').fill('800');
  await page.locator('input#d').fill('10');
  await page.waitForTimeout(3200); // stability for 3s
  await expect(page.getByText(/Demo complete/i)).toBeVisible();
}

async function huntHazards(page) {
  await page.getByRole('button', { name: /Start demo/i }).click();
  const picks = ['Pedestrians in aisle','Blind corner','Floor spill','Overhead obstacle','Unstable load','High-speed zone','Ramp/grade','Battery charge area'];
  for (const p of picks) {
    await page.getByRole('button', { name: new RegExp(p, 'i') }).click();
  }
  await expect(page.getByText(/Demo complete/i)).toBeVisible();
}

test('M3: Balance & Load Handling', async ({ page }) => {
  await page.goto(`${BASE}/module/balance-load-handling`);
  await makeStable(page);
  await expect(page.getByText(/Quick Guides/i)).toBeVisible();
  await page.getByRole('link', { name: /Start quiz/i }).click();
  await expect(page.getByRole('heading', { name: /Balance/i })).toBeVisible();
});

test('M4: Hazard Hunt', async ({ page }) => {
  await page.goto(`${BASE}/module/hazard-hunt`);
  await huntHazards(page);
  await expect(page.getByText(/Quick Guides/i)).toBeVisible();
  await page.getByRole('link', { name: /Start quiz/i }).click();
  await expect(page.getByRole('heading', { name: /Hazards|Riesgos/i })).toBeVisible();
});
