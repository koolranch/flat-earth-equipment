import { test, expect } from '@playwright/test';

test('safety page shows pricing strip with buy buttons', async ({ page }) => {
  await page.goto('/safety');
  
  // Check that all pricing plans are visible on Safety page
  await expect(page.getByTestId('safety-buy-single')).toBeVisible();
  await expect(page.getByTestId('safety-buy-five')).toBeVisible();
  await expect(page.getByTestId('safety-buy-twenty5')).toBeVisible();
  await expect(page.getByTestId('safety-buy-unlim')).toBeVisible();
});

test('safety pricing strip shows correct plan details', async ({ page }) => {
  await page.goto('/safety');
  
  // Scroll to pricing section
  await page.getByText('Pricing').scrollIntoViewIfNeeded();
  
  // Check that plan titles and prices are visible
  await expect(page.getByText('Forklift Certification – Single')).toBeVisible();
  await expect(page.getByText('$59')).toBeVisible();
  await expect(page.getByText('Forklift Certification – 5 Pack')).toBeVisible();
  await expect(page.getByText('$275')).toBeVisible();
  
  // Check redeem and full pricing links
  await expect(page.getByText('Already have a code?')).toBeVisible();
  await expect(page.getByText('See full pricing')).toBeVisible();
});
