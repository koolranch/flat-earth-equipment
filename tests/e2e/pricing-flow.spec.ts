import { test, expect } from '@playwright/test';

test('anon → /training/pricing shows plans, buy prompts sign-in', async ({ page }) => {
  await page.goto('/training/pricing');
  await expect(page.getByTestId('buy-single')).toBeVisible();
  await expect(page.getByTestId('buy-five')).toBeVisible();
  await expect(page.getByTestId('buy-twenty5')).toBeVisible();
  await expect(page.getByTestId('buy-unlim')).toBeVisible();
});

test('anon → /safety → Get Started → login?next=/training/pricing', async ({ page }) => {
  await page.goto('/safety');
  await page.getByTestId('get-started-cta').click();
  await expect(page).toHaveURL(/\/login\?next=%2Ftraining%2Fpricing/);
});

test('pricing page shows correct plan details', async ({ page }) => {
  await page.goto('/training/pricing');
  
  // Check that all plan titles are visible
  await expect(page.getByText('Forklift Certification – Single')).toBeVisible();
  await expect(page.getByText('Forklift Certification – 5 Pack')).toBeVisible();
  await expect(page.getByText('Forklift Certification – 25 Pack')).toBeVisible();
  await expect(page.getByText('Forklift Certification – Facility Unlimited')).toBeVisible();
  
  // Check pricing
  await expect(page.getByText('$59')).toBeVisible();
  await expect(page.getByText('$275')).toBeVisible();
  await expect(page.getByText('$1,375')).toBeVisible();
  await expect(page.getByText('$1,999')).toBeVisible();
});
