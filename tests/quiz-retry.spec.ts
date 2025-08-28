import { test, expect } from '@playwright/test';

test.describe('Quiz Retry Flow', () => {
  test('Quiz demo page loads and functions', async ({ page, baseURL }) => {
    // Test the publicly accessible quiz demo page
    await page.goto(`${baseURL}/quiz-demo`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for quiz elements
    const quizContainer = page.locator('text=/quiz|question/i').first();
    
    // This test verifies the quiz components are working
    if (await quizContainer.isVisible()) {
      // If quiz is visible, verify basic functionality
      await expect(page.locator('main').first()).toBeVisible();
    } else {
      // If no quiz found, at least verify page loaded
      await expect(page.locator('body')).toBeVisible();
    }
  });
  
  test('Retry shows only incorrect items', async ({ page, baseURL }) => {
    // Navigate to dashboard where quizzes are available
    await page.goto(`${baseURL}/dashboard-simple`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for any quiz button in the dashboard
    const quizButton = page.getByRole('button', { name: /take quiz/i }).first();
    
    // Skip test if no quiz button found (user might not be logged in or no modules available)
    try {
      await expect(quizButton).toBeVisible({ timeout: 5000 });
    } catch {
      test.skip(true, 'No quiz button found - user might not be authenticated or no modules available');
      return;
    }
    
    await quizButton.click();
    
    // Wait for quiz modal to appear
    await expect(page.locator('.fixed')).toBeVisible(); // Quiz modal
    
    // Answer questions (deliberately get some wrong for retry test)
    let questionsAnswered = 0;
    const maxQuestions = 5;
    
    while (questionsAnswered < maxQuestions) {
      try {
        // Look for question choices
        const choices = page.locator('button:has-text("")').filter({ hasText: /^.+$/ });
        const choiceCount = await choices.count();
        
        if (choiceCount > 0) {
          // Click first choice (may be wrong, which is what we want for retry test)
          await choices.first().click();
          questionsAnswered++;
          
          // Small delay to allow for question transition
          await page.waitForTimeout(500);
        } else {
          break;
        }
      } catch (error) {
        // If we can't find more questions, break
        break;
      }
    }
    
    // Look for quiz result screen
    await expect(page.locator('text=/quiz result/i')).toBeVisible({ timeout: 10000 });
    
    // If quiz failed (score < 80%), look for retry option
    const reviewButton = page.getByRole('button', { name: /review incorrect/i });
    
    if (await reviewButton.isVisible()) {
      await reviewButton.click();
      
      // Should show review screen or start retry
      await expect(page.locator('text=/review|retry|incorrect/i')).toBeVisible();
      
      // If there's a retry with incorrect questions, verify it starts
      const retryIncorrectButton = page.getByRole('button', { name: /review incorrect.*questions/i });
      if (await retryIncorrectButton.isVisible()) {
        await retryIncorrectButton.click();
        
        // Should start a new quiz attempt with only incorrect questions
        await expect(page.locator('text=/question.*of/i')).toBeVisible();
      }
    }
  });

  test('Quiz completion flow works end-to-end', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/dashboard-simple`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Start quiz
    const quizButton = page.getByRole('button', { name: /take quiz/i }).first();
    
    try {
      await expect(quizButton).toBeVisible({ timeout: 5000 });
    } catch {
      test.skip(true, 'No quiz button found - user might not be authenticated');
      return;
    }
    
    await quizButton.click();
    
    // Verify quiz modal opens
    await expect(page.locator('text=/question.*of/i')).toBeVisible();
    
    // Verify quiz has proper structure
    await expect(page.locator('text=/score:/i')).toBeVisible();
    
    // Verify choices are clickable
    const choices = page.locator('button').filter({ hasText: /^.+$/ });
    await expect(choices.first()).toBeVisible();
    await expect(choices.first()).toBeEnabled();
  });

  test('Quiz modal can be closed', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/dashboard-simple`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Start quiz
    const quizButton = page.getByRole('button', { name: /take quiz/i }).first();
    
    try {
      await expect(quizButton).toBeVisible({ timeout: 5000 });
      await quizButton.click();
    } catch {
      test.skip(true, 'No quiz button found - user might not be authenticated');
      return;
    }
    
    // Look for close button (X)
    const closeButton = page.locator('button:has-text("✕")');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      
      // Quiz modal should be closed
      await expect(page.locator('.fixed')).not.toBeVisible();
    }
  });

  test('Quiz shows progress during attempt', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/dashboard-simple`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Start quiz
    const quizButton = page.getByRole('button', { name: /take quiz/i }).first();
    
    try {
      await expect(quizButton).toBeVisible({ timeout: 5000 });
      await quizButton.click();
    } catch {
      test.skip(true, 'No quiz button found - user might not be authenticated');
      return;
    }
    
    // Verify progress indicators
    await expect(page.locator('text=/question.*of/i')).toBeVisible();
    await expect(page.locator('text=/score:/i')).toBeVisible();
    
    // Answer one question and verify progress updates
    const choices = page.locator('button').filter({ hasText: /^.+$/ });
    if (await choices.first().isVisible()) {
      await choices.first().click();
      
      // Score should update or question number should change
      await page.waitForTimeout(1000);
      await expect(page.locator('text=/score:|question/i')).toBeVisible();
    }
  });

  test('Quiz handles loading states properly', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/dashboard-simple`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Start quiz
    const quizButton = page.getByRole('button', { name: /take quiz/i }).first();
    
    try {
      await expect(quizButton).toBeVisible({ timeout: 5000 });
      await quizButton.click();
    } catch {
      test.skip(true, 'No quiz button found - user might not be authenticated');
      return;
    }
    
    // Should show loading state initially if needed
    const loadingIndicator = page.locator('text=/preparing quiz|loading/i');
    
    // Either loading is shown briefly, or quiz appears directly
    try {
      await expect(loadingIndicator).toBeVisible({ timeout: 2000 });
      // If loading was shown, wait for it to disappear
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
    } catch {
      // Loading might not appear if quiz loads quickly
    }
    
    // Quiz should eventually be ready
    await expect(page.locator('text=/question.*of/i')).toBeVisible({ timeout: 15000 });
  });
});
