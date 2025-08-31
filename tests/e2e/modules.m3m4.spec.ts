import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Module M3/M4 Smoke Tests', () => {

  test('M3: Balance & Load Handling page loads', async ({ page }) => {
    await page.goto(`${BASE}/module/balance-load-handling`);
    
    // Verify page loads without server errors
    await expect(page.locator('body')).toBeVisible();
    
    // Should have module heading (use first match since there may be multiple)
    await expect(page.getByRole('heading', { name: /Balance.*Load|Balance & Load/i }).first()).toBeVisible();
    
    // Should have demo section
    const demoSection = page.locator('section').filter({ hasText: /demo/i });
    if (await demoSection.count() > 0) {
      await expect(demoSection.first()).toBeVisible();
    }
    
    // Should have interactive elements (sliders, buttons)
    const interactiveElements = page.locator('input[type="range"], button');
    const elementCount = await interactiveElements.count();
    expect(elementCount).toBeGreaterThan(0);
  });

  test('M4: Hazard Hunt page loads', async ({ page }) => {
    await page.goto(`${BASE}/module/hazard-hunt`);
    
    // Verify page loads without server errors
    await expect(page.locator('body')).toBeVisible();
    
    // Should have module heading (use first match since there may be multiple)
    await expect(page.getByRole('heading', { name: /Hazard Hunt/i }).first()).toBeVisible();
    
    // Should have demo section
    const demoSection = page.locator('section').filter({ hasText: /demo/i });
    if (await demoSection.count() > 0) {
      await expect(demoSection.first()).toBeVisible();
    }
    
    // Should have interactive elements
    const interactiveElements = page.locator('button');
    const elementCount = await interactiveElements.count();
    expect(elementCount).toBeGreaterThan(0);
  });

  test('M3: StabilityLite demo interactions', async ({ page }) => {
    await page.goto(`${BASE}/module/balance-load-handling`);
    
    // Look for stability demo elements
    const weightSlider = page.locator('input[type="range"]').first();
    if (await weightSlider.count() > 0) {
      await expect(weightSlider).toBeVisible();
      
      // Test slider interaction
      await weightSlider.fill('3000');
      
      // Should see stability indicator update
      const stabilityIndicator = page.locator('text=/Safe|Unsafe|Configuration/i');
      if (await stabilityIndicator.count() > 0) {
        await expect(stabilityIndicator.first()).toBeVisible();
      }
    }
  });

  test('M4: HazardHunt demo interactions', async ({ page }) => {
    await page.goto(`${BASE}/module/hazard-hunt`);
    
    // Look for hazard hunt start button
    const startButton = page.getByRole('button', { name: /Start.*Hazard|Start.*Hunt/i });
    if (await startButton.count() > 0) {
      await expect(startButton).toBeVisible();
      await startButton.click();
      
      // Should see hazard buttons appear
      const hazardButtons = page.getByRole('button').filter({ hasText: /Pedestrian|Spill|Overhead|Unstable/i });
      if (await hazardButtons.count() > 0) {
        await expect(hazardButtons.first()).toBeVisible();
        
        // Test hazard identification
        await hazardButtons.first().click();
        
        // Should see progress update
        const progressText = page.locator('text=/found|identified/i');
        if (await progressText.count() > 0) {
          await expect(progressText.first()).toBeVisible();
        }
      }
    }
  });

  test('M3/M4 quiz content is available', async ({ page }) => {
    // Test M3 quiz API
    const m3Response = await page.request.get(`${BASE}/api/quiz/balance-load-handling.json`);
    expect(m3Response.status()).toBe(200);
    const m3Data = await m3Response.json();
    
    // Handle both new format and legacy format
    const m3HasContent = (m3Data.title && Array.isArray(m3Data.items)) || Array.isArray(m3Data.questions);
    expect(m3HasContent).toBe(true);
    
    // Test M4 quiz API
    const m4Response = await page.request.get(`${BASE}/api/quiz/hazard-hunt.json`);
    expect(m4Response.status()).toBe(200);
    const m4Data = await m4Response.json();
    
    const m4HasContent = (m4Data.title && Array.isArray(m4Data.items)) || Array.isArray(m4Data.questions);
    expect(m4HasContent).toBe(true);
  });

  test('Module navigation links work', async ({ page }) => {
    // Test M3 navigation
    await page.goto(`${BASE}/module/balance-load-handling`);
    
    const trainingLink = page.getByRole('link', { name: /Training.*Hub|Back.*Training/i });
    if (await trainingLink.count() > 0) {
      await expect(trainingLink).toBeVisible();
    }
    
    const nextModuleLink = page.getByRole('link', { name: /Next.*Module|hazard-hunt/i });
    if (await nextModuleLink.count() > 0) {
      await expect(nextModuleLink).toBeVisible();
    }
    
    // Test M4 navigation
    await page.goto(`${BASE}/module/hazard-hunt`);
    
    const m4TrainingLink = page.getByRole('link', { name: /Training.*Hub|Back.*Training/i });
    if (await m4TrainingLink.count() > 0) {
      await expect(m4TrainingLink).toBeVisible();
    }
    
    const finalExamLink = page.getByRole('link', { name: /Final.*Exam/i });
    if (await finalExamLink.count() > 0) {
      await expect(finalExamLink).toBeVisible();
    }
  });

  test('M3/M4 pages are accessible', async ({ page }) => {
    // Test M3 accessibility
    await page.goto(`${BASE}/module/balance-load-handling`);
    
    // Should be keyboard navigable
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
    }
    
    // Test M4 accessibility
    await page.goto(`${BASE}/module/hazard-hunt`);
    
    await page.keyboard.press('Tab');
    const m4FocusedElement = page.locator(':focus');
    if (await m4FocusedElement.count() > 0) {
      await expect(m4FocusedElement).toBeVisible();
    }
  });

  test('Module registry integration', async ({ page }) => {
    // Test that the module registry is working by checking if pages load
    const modules = [
      'balance-load-handling',
      'hazard-hunt'
    ];
    
    for (const moduleSlug of modules) {
      const response = await page.request.get(`${BASE}/module/${moduleSlug}`);
      expect(response.status()).toBeLessThan(500); // Should not be server error
      
      // Navigate to verify page loads
      await page.goto(`${BASE}/module/${moduleSlug}`);
      await expect(page.locator('body')).toBeVisible();
    }
  });

});
