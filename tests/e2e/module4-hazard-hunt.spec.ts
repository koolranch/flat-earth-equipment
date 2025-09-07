import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Module 4 — Hazard Hunt', () => {
  test('loads and can find a few hazards', async ({ page }) => {
    await page.goto(`${BASE_URL}/training/module-4`);
    await expect(page.getByRole('heading', { name: /Hazard Hunt/i })).toBeVisible();

    // start
    await page.getByRole('button', { name: /Start/i }).click();

    // click 3 hotspots (selector: absolute buttons)
    const buttons = page.locator('button[aria-label]');
    await buttons.nth(0).click();
    await buttons.nth(1).click();
    await buttons.nth(2).click();

    // found counter updates
    await expect(page.getByText(/Found: 3/)).toBeVisible();
  });
});
