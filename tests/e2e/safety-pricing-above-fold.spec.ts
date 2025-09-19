import { test, expect } from '@playwright/test';

test('safety page shows above-the-fold pricing strip', async ({ page }) => {
  await page.goto('/safety');
  
  // Check that hero has "See pricing" button
  await expect(page.getByTestId('hero-see-pricing')).toBeVisible();
  
  // Click the hero pricing link
  await page.getByTestId('hero-see-pricing').click();
  
  // Should scroll to pricing section
  await expect(page.locator('#pricing')).toBeVisible();
  
  // Check that all buy buttons are visible in the pricing strip
  await expect(page.getByTestId('safety-top-buy-single')).toBeVisible();
  await expect(page.getByTestId('safety-top-buy-five')).toBeVisible();
  await expect(page.getByTestId('safety-top-buy-twenty5')).toBeVisible();
  await expect(page.getByTestId('safety-top-buy-unlim')).toBeVisible();
});

test('pricing strip shows correct plan details', async ({ page }) => {
  await page.goto('/safety');
  
  // Scroll to pricing section
  await page.locator('#pricing').scrollIntoViewIfNeeded();
  
  // Check that plan titles and prices are visible
  await expect(page.getByText('Forklift Certification – Single')).toBeVisible();
  await expect(page.getByText('$59')).toBeVisible();
  await expect(page.getByText('Forklift Certification – 5 Pack')).toBeVisible();
  await expect(page.getByText('$275')).toBeVisible();
  
  // Check navigation links
  await expect(page.getByText('Already have a code?')).toBeVisible();
  await expect(page.getByText('See how it works')).toBeVisible();
});
