import { test, expect } from '@playwright/test';

test('anon → /safety shows pricing plans', async ({ page }) => {
  await page.goto('/safety');
  await expect(page.getByTestId('safety-top-buy-single').first()).toBeVisible();
  await expect(page.getByTestId('safety-top-buy-five').first()).toBeVisible();
  await expect(page.getByTestId('safety-top-buy-twenty5').first()).toBeVisible();
  await expect(page.getByTestId('safety-top-contact-unlim').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Facility Unlimited Annual' }).first()).toBeVisible();
});

test('anon → /safety shows primary CTA', async ({ page }) => {
  await page.goto('/safety');
  await expect(page.getByRole('button', { name: 'Start — $49' }).first()).toBeVisible();
});

test('pricing page shows correct plan details', async ({ page }) => {
  await page.goto('/safety');
  
  // Check that all plan titles are visible
  await expect(page.getByRole('heading', { name: 'Single Operator' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Team 5-Pack' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Team 25-Pack' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Facility Unlimited Annual' }).first()).toBeVisible();
  
  // Check pricing
  await expect(page.getByText('$49').first()).toBeVisible();
  await expect(page.getByText('$225').first()).toBeVisible();
  await expect(page.getByText('$999').first()).toBeVisible();
  await expect(page.getByText('$1,999').first()).toBeVisible();
  await expect(page.getByText('/year').first()).toBeVisible();
});
