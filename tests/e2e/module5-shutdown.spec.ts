import { test, expect } from '@playwright/test';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test('Module 5 — Shutdown order clickable', async ({ page }) => {
  await page.goto(`${BASE_URL}/training/module-5`);
  await expect(page.getByRole('heading', { name: /Shutdown Trainer/i })).toBeVisible();

  // click steps in order
  const steps = [
    'Shift to Neutral',
    'Steer Wheels Straight',
    'Set Parking Brake',
    'Lower Forks to Ground',
    'Turn Key Off',
    'Connect Charger',
    'Place Wheel Chock'
  ];

  for (const label of steps) {
    await page.getByRole('button', { name: new RegExp(label, 'i') }).click();
  }

  await expect(page.getByText(/Shutdown complete./i)).toBeVisible();
});
