import { test, expect } from '@playwright/test';

test('safety pricing shows links not Buy buttons', async ({ page }) => {
  await page.goto('/safety');
  
  // Should show "See on pricing page" links instead of Buy buttons
  await expect(page.getByTestId('safety-see-single')).toBeVisible();
  await expect(page.getByTestId('safety-see-five')).toBeVisible();
  await expect(page.getByTestId('safety-see-twenty5')).toBeVisible();
  await expect(page.getByTestId('safety-see-unlim')).toBeVisible();
  
  // Should NOT show Buy buttons
  await expect(page.getByTestId('safety-top-buy-single')).toHaveCount(0);
  await expect(page.getByTestId('safety-top-buy-five')).toHaveCount(0);
  await expect(page.getByTestId('safety-top-buy-twenty5')).toHaveCount(0);
  await expect(page.getByTestId('safety-top-buy-unlim')).toHaveCount(0);
});

test('pricing page still has working Buy buttons', async ({ page }) => {
  await page.goto('/training/pricing');
  
  // Should show actual Buy buttons on the pricing page
  await expect(page.getByTestId('buy-single')).toBeVisible();
  await expect(page.getByTestId('buy-five')).toBeVisible();
  await expect(page.getByTestId('buy-twenty5')).toBeVisible();
  await expect(page.getByTestId('buy-unlim')).toBeVisible();
});

test('safety links redirect to pricing page', async ({ page }) => {
  await page.goto('/safety');
  
  // Click "See on pricing page" link
  await page.getByTestId('safety-see-single').click();
  
  // Should navigate to pricing page
  await expect(page).toHaveURL('/training/pricing');
});
