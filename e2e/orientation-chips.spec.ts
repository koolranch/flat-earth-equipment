import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Orientation demo chips', () => {
  test('open and complete the three micro-demos', async ({ page }) => {
    await page.goto(`${BASE}/training/orientation`);

    // PPE sequence
    await page.getByRole('button', { name: /PPE sequence demo/i }).click();
    await page.getByRole('button', { name: /Vest/i }).click();
    await page.getByRole('button', { name: /Hard hat/i }).click();
    await page.getByRole('button', { name: /Seatbelt/i }).click();
    await expect(page.getByRole('status')).toContainText(/Demo complete/i);

    // Find a hazard
    await page.getByRole('button', { name: /Find a hazard/i }).click();
    await page.getByRole('button', { name: /Hazard spill hotspot/i }).click();
    await expect(page.getByRole('status')).toContainText(/Demo complete/i);

    // Identify a control
    await page.getByRole('button', { name: /Identify a control/i }).click();
    await page.getByRole('button', { name: /^Horn$/i }).click();
    await expect(page.getByRole('status')).toContainText(/Demo complete/i);
  });
});
