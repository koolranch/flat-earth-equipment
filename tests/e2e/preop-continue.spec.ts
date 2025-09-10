import { test, expect } from '@playwright/test';

// Smoke: After marking items complete, Continue should navigate to course root
// Assumes the test user is already authenticated and on the preop page.

test('preop continue navigates to course modules', async ({ page }) => {
  // Go directly to Module 1 pre-op page
  await page.goto('/training/modules/pre-op');
  
  // Complete all the pre-op steps by clicking each card
  const stepCards = page.locator('button[aria-pressed]');
  const count = await stepCards.count();
  
  for (let i = 0; i < count; i++) {
    await stepCards.nth(i).click();
  }
  
  // Continue button should be enabled and clickable
  const continueButton = page.getByTestId('preop-continue');
  await expect(continueButton).toBeEnabled();
  await continueButton.click();
  
  // Verify we navigate back to the training course page
  await expect(page).toHaveURL(/\/training\?courseId=forklift_operator$/);
  await expect(page.getByText(/Forklift Operator Training/i)).toBeVisible();
});
