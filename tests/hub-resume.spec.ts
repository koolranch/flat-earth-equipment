import { test, expect } from '@playwright/test';

test.describe('Training Hub Resume Flow', () => {
  test('Hub shows Resume CTA and it navigates', async ({ page, baseURL }) => {
    const courseId = process.env.QA_COURSE_ID || '';
    test.skip(!courseId, 'QA_COURSE_ID not set - provide via environment variable');
    
    // Navigate to training hub with course ID
    await page.goto(`${baseURL}/training?courseId=${courseId}`);
    
    // Wait for page to load and check for training hub content
    await expect(page.locator('h1:has-text("Training Hub")')).toBeVisible();
    
    // Look for Resume CTA - should be visible and clickable
    const resume = page.getByRole('link', { name: /resume training/i });
    await expect(resume).toBeVisible();
    
    // Verify it's a proper link (not disabled)
    await expect(resume).toBeEnabled();
    
    // Click resume and verify navigation
    await resume.click();
    
    // Should navigate to a module page
    await expect(page).toHaveURL(/\/module\//);
    
    // Verify we're on a valid module page
    await expect(page.locator('main')).toBeVisible();
  });

  test('Hub shows progress and remaining steps', async ({ page, baseURL }) => {
    const courseId = process.env.QA_COURSE_ID || '';
    test.skip(!courseId, 'QA_COURSE_ID not set - provide via environment variable');
    
    await page.goto(`${baseURL}/training?courseId=${courseId}`);
    
    // Check for progress display
    await expect(page.locator('text=/Progress:/i')).toBeVisible();
    
    // Check for "What's left" section
    await expect(page.locator('h2:has-text("What\'s left")')).toBeVisible();
    
    // Verify there are actionable links in the remaining steps
    const stepLinks = page.locator('a:has-text("Open")');
    await expect(stepLinks.first()).toBeVisible();
  });

  test('Hub handles missing course ID gracefully', async ({ page, baseURL }) => {
    // Navigate without courseId parameter
    await page.goto(`${baseURL}/training`);
    
    // Should show error message about missing courseId
    await expect(page.locator('text=/Provide.*courseId/i')).toBeVisible();
  });

  test('Hub is mobile responsive', async ({ page, baseURL }) => {
    const courseId = process.env.QA_COURSE_ID || '';
    test.skip(!courseId, 'QA_COURSE_ID not set - provide via environment variable');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${baseURL}/training?courseId=${courseId}`);
    
    // Verify mobile layout elements are visible
    await expect(page.locator('h1:has-text("Training Hub")')).toBeVisible();
    
    // Progress header should be sticky and visible
    const progressHeader = page.locator('header');
    await expect(progressHeader).toBeVisible();
    
    // Resume button should be touch-friendly
    const resume = page.getByRole('link', { name: /resume training/i });
    if (await resume.isVisible()) {
      const boundingBox = await resume.boundingBox();
      expect(boundingBox?.height).toBeGreaterThan(40); // Minimum touch target
    }
  });
});
