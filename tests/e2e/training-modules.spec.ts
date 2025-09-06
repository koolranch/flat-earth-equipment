import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

// Helpers
async function gotoAndH1(page: any, path: string, h1Text: string) {
  await page.goto(`${BASE}${path}`);
  await expect(page.getByRole('heading', { level: 1, name: h1Text })).toBeVisible();
}

// Module 1: Pre-Operation — stepper with animated SVGs
// Interactions: click "Mark Step Complete", then "Next →" until Finish
test('Module 1: Pre-Operation smoke', async ({ page }) => {
  await gotoAndH1(page, '/training/module/1', 'Module 1: Pre-Operation');
  // Step 1: Mark complete
  await page.getByRole('button', { name: 'Mark Step Complete' }).click();
  // Step 2..n: keep pressing Next until Finish appears at final step
  for (let i = 0; i < 5; i++) {
    const nextBtn = page.getByRole('button', { name: /Next/ });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }
  }
  // Final step: Finish
  const finish = page.getByRole('button', { name: 'Finish' });
  await expect(finish).toBeVisible();
});

// Module 2: 8-Point Inspection — toggles must all be on; then Continue button appears
test('Module 2: 8-Point Inspection smoke', async ({ page }) => {
  await gotoAndH1(page, '/training/module/2', 'Module 2: 8-Point Inspection');
  // Flip all toggle buttons (they use aria-pressed)
  const toggles = page.locator('button[aria-pressed]');
  const count = await toggles.count();
  expect(count).toBeGreaterThanOrEqual(8);
  for (let i = 0; i < count; i++) {
    await toggles.nth(i).click();
  }
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
});

// Module 3: Balance & Load — sliders + stability hint text visible
test('Module 3: Balance & Load smoke', async ({ page }) => {
  await gotoAndH1(page, '/training/module/3', 'Module 3: Balance & Load Handling');
  // Sliders have role=slider (Radix). Nudge them via keyboard to trigger change.
  const sliders = page.getByRole('slider');
  await expect(sliders.first()).toBeVisible();
  await sliders.first().focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('Stability check:')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
});

// Module 4: Hazard Spotting — smoke-load only (click-through varies by implementation)
test('Module 4: Hazard Spotting page loads', async ({ page }) => {
  await gotoAndH1(page, '/training/module/4', 'Module 4: Hazard Spotting');
  // Minimal assertion: scene container exists or any hotspot marker
  // Feel free to refine selectors to your implementation (data-testid, etc.)
  await expect(page.locator('svg')).toBeVisible();
});

// Module 5: Shutdown — stepper with animations
test('Module 5: Shutdown smoke', async ({ page }) => {
  await gotoAndH1(page, '/training/module/5', 'Module 5: Shutdown');
  // Step 1
  await page.getByRole('button', { name: 'Mark Step Complete' }).click();
  // Next steps
  for (let i = 0; i < 6; i++) {
    const nextBtn = page.getByRole('button', { name: /Next/ });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }
  }
  await expect(page.getByRole('button', { name: 'Finish' })).toBeVisible();
});
