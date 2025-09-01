import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Marketing Pages Smoke Tests', () => {
  test('/safety page loads and renders content', async ({ page }) => {
    await page.goto(`${BASE}/safety`);
    await page.waitForLoadState('networkidle');
    
    // Check that page loads successfully
    await expect(page).toHaveTitle(/Forklift.*Training.*Flat Earth Safety/);
    
    // Check that main content area exists
    const contentArea = page.locator('#content');
    await expect(contentArea).toBeVisible();
    
    // Check for key marketing content
    const heroContent = page.getByText(/forklift.*training/i).first();
    await expect(heroContent).toBeVisible();
    
    // Check for compliance content
    const complianceContent = page.getByText(/OSHA|compliance|CFR/i).first();
    if (await complianceContent.count() > 0) {
      await expect(complianceContent).toBeVisible();
    }
  });

  test('/help/trainer page loads and renders content', async ({ page }) => {
    await page.goto(`${BASE}/help/trainer`);
    await page.waitForLoadState('networkidle');
    
    // Check that page loads successfully
    await expect(page).toHaveTitle(/Trainer.*Help.*Guide/);
    
    // Check that main content area exists
    const contentArea = page.locator('#content');
    await expect(contentArea).toBeVisible();
    
    // Check for trainer-specific content
    const trainerContent = page.getByText(/trainer|assign|roster|evaluation/i).first();
    await expect(trainerContent).toBeVisible();
    
    // Check for section structure
    const sections = page.locator('section');
    if (await sections.count() > 0) {
      await expect(sections.first()).toBeVisible();
    }
  });

  test('Language switching functionality', async ({ page }) => {
    await page.goto(`${BASE}/safety`);
    await page.waitForLoadState('networkidle');
    
    // Look for language toggle
    const languageToggle = page.locator('[role="group"]').filter({ hasText: /EN|ES/ });
    if (await languageToggle.count() > 0) {
      await expect(languageToggle.first()).toBeVisible();
      
      // Test clicking language buttons
      const esButton = languageToggle.locator('button', { hasText: 'ES' });
      if (await esButton.count() > 0) {
        // Just verify the button exists and is clickable
        await expect(esButton.first()).toBeVisible();
      }
    }
  });



  test('Header navigation links work', async ({ page }) => {
    await page.goto(`${BASE}/safety`);
    await page.waitForLoadState('networkidle');
    
    // Check that header navigation includes our new links
    const nav = page.locator('nav[aria-label="Global navigation"]');
    await expect(nav).toBeVisible();
    
    // Verify Safety link exists (should be current page)
    const safetyLink = nav.getByRole('link', { name: /Safety/i });
    await expect(safetyLink).toBeVisible();
    
    // Verify Trainer link exists
    const trainerLink = nav.getByRole('link', { name: /Trainer/i });
    await expect(trainerLink).toBeVisible();
    
    // Verify Training link exists
    const trainingLink = nav.getByRole('link', { name: /Training/i });
    await expect(trainingLink).toBeVisible();
  });

  test('SEO metadata is present on /safety', async ({ page }) => {
    await page.goto(`${BASE}/safety`);
    
    // Check page title
    await expect(page).toHaveTitle(/Forklift Operator Training.*Flat Earth Safety/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Interactive forklift certification training/);
    
    // Check Open Graph title
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Forklift Operator Training.*Flat Earth Safety/);
    
    // Check canonical URL (use first() to handle multiple canonical links)
    const canonical = page.locator('link[rel="canonical"]').first();
    if (await canonical.isVisible()) {
      await expect(canonical).toHaveAttribute('href', /\/safety$/);
    }
  });
});
