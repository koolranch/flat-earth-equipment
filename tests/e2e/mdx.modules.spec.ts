import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

for (const slug of ['pre-operation-inspection','eight-point-inspection']){
  test(`MDX module renders: ${slug}`, async ({ page }) => {
    await page.goto(`${BASE}/training/modules/${slug}`);
    
    // Wait for page to load and check for main content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check that MDX content is rendered (objectives should be present)
    await expect(page.getByText('Objectives')).toBeVisible();
    
    // Look for MicroQuiz if present and try to interact (lenient)
    try {
      const quizChoices = page.locator('button').filter({ hasText: /vest|hat|brake|wipe|tag/i });
      const choiceCount = await quizChoices.count();
      
      if (choiceCount > 0) {
        // Click the first available choice
        await quizChoices.first().click();
        
        // Try to find Next/Finish button and click it
        const nextButton = page.locator('button').filter({ hasText: /next|finish/i });
        if (await nextButton.isVisible({ timeout: 2000 })) {
          await nextButton.click();
        }
      }
    } catch (error) {
      // Lenient - don't fail if quiz interaction doesn't work
      console.log(`Quiz interaction failed for ${slug}, but continuing test`);
    }
    
    // Verify sticky header with Resume button
    await expect(page.locator('a').filter({ hasText: 'Resume' })).toBeVisible();
  });
}
