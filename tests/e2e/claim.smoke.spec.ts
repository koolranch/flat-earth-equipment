import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const token = process.env.INVITE_TOKEN_E2E;

test.describe('Claim Page Smoke Tests', () => {
  test('Claim page renders without authentication', async ({ page }) => {
    // Test with either a provided token or an invalid one to check error handling
    const testToken = token || 'invalid-test-token-12345';
    
    await page.goto(`${BASE}/claim/${testToken}`);
    await page.waitForLoadState('networkidle');
    
    // Should show either claim interface, error message, or sign-in prompt
    await expect(page.getByText(/Claim your seat|Invalid|expired|unknown|Sign in/i).first()).toBeVisible();
    
    // Check that the page has proper title and structure
    await expect(page).toHaveTitle(/Claim.*Training.*Flat Earth Safety/i);
    
    // Verify main content area exists
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });

  test('Invalid token shows appropriate error message', async ({ page }) => {
    await page.goto(`${BASE}/claim/definitely-invalid-token-xyz`);
    await page.waitForLoadState('networkidle');
    
    // Should show error message for invalid token
    await expect(page.getByText(/Invalid.*invitation/i)).toBeVisible();
  });

  // Conditional test that only runs when environment is properly configured
  test.describe('Full Claim Flow', () => {
    test.skip(!token, 'Set INVITE_TOKEN_E2E environment variable to run full claim acceptance tests');
    
    test('Valid token shows claim interface when not authenticated', async ({ page }) => {
      test.skip(!token, 'INVITE_TOKEN_E2E not provided');
      
      await page.goto(`${BASE}/claim/${token}`);
      await page.waitForLoadState('networkidle');
      
      // Should show either the claim form or sign-in prompt
      const hasClaimButton = await page.getByRole('button', { name: /accept.*seat/i }).isVisible();
      const hasSignInLink = await page.getByRole('link', { name: /sign.*in/i }).isVisible();
      
      expect(hasClaimButton || hasSignInLink).toBeTruthy();
      
      if (hasSignInLink) {
        // Verify sign-in link has correct redirect
        const signInLink = page.getByRole('link', { name: /sign.*in/i });
        await expect(signInLink).toHaveAttribute('href', new RegExp(`/login.*next.*claim.*${token}`));
      }
    });

    test('Accept button functionality (requires authenticated session)', async ({ page }) => {
      test.skip(!token, 'INVITE_TOKEN_E2E not provided');
      test.skip(!process.env.E2E_TEST_SESSION, 'Set E2E_TEST_SESSION=1 and ensure authenticated session exists');
      
      await page.goto(`${BASE}/claim/${token}`);
      await page.waitForLoadState('networkidle');
      
      // Look for the Accept button (only visible when authenticated)
      const acceptButton = page.getByRole('button', { name: /accept.*seat/i });
      
      if (await acceptButton.isVisible()) {
        // Click the accept button
        await acceptButton.click();
        
        // Should either redirect to training or show success message
        await page.waitForTimeout(2000); // Allow for API call and redirect
        
        // Check for success indicators
        const isRedirected = page.url().includes('/training');
        const hasSuccessMessage = await page.getByText(/success|enrolled|claimed/i).isVisible();
        
        expect(isRedirected || hasSuccessMessage).toBeTruthy();
        
        if (isRedirected) {
          // Verify we're on the training page
          await expect(page).toHaveURL(new RegExp('/training'));
          await expect(page.getByText(/training|modules|progress/i)).toBeVisible();
        }
      } else {
        // If no accept button, should have sign-in link
        await expect(page.getByRole('link', { name: /sign.*in/i })).toBeVisible();
      }
    });
  });

  test('Claim page has proper SEO and accessibility', async ({ page }) => {
    const testToken = token || 'test-token-123';
    
    await page.goto(`${BASE}/claim/${testToken}`);
    await page.waitForLoadState('networkidle');
    
    // Check for proper heading structure
    const mainHeading = page.getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();
    
    // Verify page has proper meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /invitation.*training/i);
    
    // Check for main landmark
    const mainLandmark = page.locator('main').first();
    await expect(mainLandmark).toBeVisible();
  });

  test('Expired token handling', async ({ page }) => {
    // This would require a known expired token, so we'll just test the general error handling
    await page.goto(`${BASE}/claim/expired-token-test`);
    await page.waitForLoadState('networkidle');
    
    // Should show some form of error or invalid message
    const errorIndicators = page.getByText(/invalid|expired|unknown|not found/i);
    await expect(errorIndicators.first()).toBeVisible();
    
    // Should not show accept button for invalid tokens
    const acceptButton = page.getByRole('button', { name: /accept.*seat/i });
    await expect(acceptButton).not.toBeVisible();
  });
});
