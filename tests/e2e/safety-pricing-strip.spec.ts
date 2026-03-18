import { test, expect } from '@playwright/test';

test('safety page shows pricing strip with buy buttons', async ({ page }) => {
  await page.goto('/safety');
  
  // Check that the pricing CTAs are visible on Safety page
  await expect(page.getByTestId('safety-top-buy-single').first()).toBeVisible();
  await expect(page.getByTestId('safety-top-buy-five').first()).toBeVisible();
  await expect(page.getByTestId('safety-top-buy-twenty5').first()).toBeVisible();
  await expect(page.getByTestId('safety-top-contact-unlim').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Facility Unlimited Annual' }).first()).toBeVisible();
});

test('safety pricing strip shows correct plan details', async ({ page }) => {
  await page.goto('/safety');
  
  // Scroll to pricing section
  await page.locator('#pricing').scrollIntoViewIfNeeded();
  
  // Check that plan titles and prices are visible
  await expect(page.getByRole('heading', { name: 'Single Operator' }).first()).toBeVisible();
  await expect(page.getByText('$49').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Team 5-Pack' }).first()).toBeVisible();
  await expect(page.getByText('$225').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Team 25-Pack' }).first()).toBeVisible();
  await expect(page.getByText('$999').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Facility Unlimited Annual' }).first()).toBeVisible();
  await expect(page.getByText('/year').first()).toBeVisible();
  
  // Check redeem and full pricing links
  await expect(page.getByText('Already have a code?')).toBeVisible();
  await expect(page.getByText('See full pricing')).toBeVisible();
});
