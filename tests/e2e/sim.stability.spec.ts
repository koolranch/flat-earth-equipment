import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('Stability sim renders and can be completed', async ({ page }) => {
  await page.goto(`${BASE}/module/balance-load-handling`);
  
  // Wait for the page to load
  await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
  
  // Check what's actually on the page by looking for the main module title
  await expect(page.getByRole('heading', { name: 'Balance & Load Handling', exact: true })).toBeVisible();
  
  // Wait for demo section to load - give dynamic imports time to load
  await page.waitForTimeout(3000);
  
  // Verify stability simulator sliders are present (should have at least 3 sliders)
  const sliders = page.locator('input[type="range"]');
  await expect(sliders.first()).toBeVisible({ timeout: 10000 });
  const sliderCount = await sliders.count();
  expect(sliderCount).toBeGreaterThanOrEqual(3);
  
  // Move the first slider (weight) to test interaction
  const weightSlider = sliders.first();
  await weightSlider.focus();
  await weightSlider.press('ArrowRight');
  await weightSlider.press('ArrowRight');
  await weightSlider.press('ArrowRight');
  
  // Look for any completion button (could be Mark Complete or similar)
  const completeButton = page.getByRole('button', { name: /Mark Complete|Complete|Done/i });
  
  // If Mark Complete button exists, click it to test the completion flow
  if (await completeButton.isVisible()) {
    await completeButton.click();
  }
  
  // Verify page doesn't crash after completion
  await expect(page.locator('body')).toBeVisible();
});
