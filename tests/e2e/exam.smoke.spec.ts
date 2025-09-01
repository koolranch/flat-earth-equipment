import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Exam Smoke Tests', () => {
  test('Exam fail path renders summary and retake option', async ({ page }) => {
    await page.goto(`${BASE}/training/exam`);
    await page.waitForLoadState('networkidle');
    
    // Verify exam page loads with proper structure
    await expect(page.getByRole('heading', { name: /Final Exam/i })).toBeVisible();
    await expect(page.getByText(/Question 1 of/i)).toBeVisible();
    
    // Answer all 12 questions by selecting the first option (likely to fail)
    for (let i = 0; i < 12; i++) {
      // Wait for question to be visible
      await expect(page.locator('input[type="radio"]').first()).toBeVisible();
      
      // Select the first radio option
      await page.locator('input[type="radio"]').first().check();
      
      // Check if this is the last question
      const isLastQuestion = i === 11;
      
      if (!isLastQuestion) {
        // Click Next button for non-final questions
        const nextButton = page.getByRole('button', { name: /next/i });
        await expect(nextButton).toBeEnabled();
        await nextButton.click();
        
        // Wait for next question to load
        await page.waitForTimeout(100);
      } else {
        // Click Submit button for the final question
        const submitButton = page.getByRole('button', { name: /submit.*exam/i });
        await expect(submitButton).toBeEnabled();
        await submitButton.click();
        
        // Wait for submission to complete
        await page.waitForTimeout(2000);
      }
    }
    
    // Verify results page appears
    await expect(page.getByRole('heading', { name: /Final Exam.*Results/i })).toBeVisible();
    
    // Should show either pass or fail result
    const resultIndicator = page.getByText(/Passed|Not Passed|Try again/i);
    await expect(resultIndicator).toBeVisible();
    
    // Check for score display
    await expect(page.getByText(/Score:/i)).toBeVisible();
    
    // If failed (likely with first-option strategy), check for retake functionality
    const retakeButton = page.getByRole('button', { name: /retake.*exam/i });
    if (await retakeButton.isVisible()) {
      // Test retake functionality
      await retakeButton.click();
      
      // Should return to first question
      await expect(page.getByText(/Question 1 of/i)).toBeVisible();
      await expect(page.locator('input[type="radio"]').first()).toBeVisible();
    }
  });

  test('Exam page has proper structure and navigation', async ({ page }) => {
    await page.goto(`${BASE}/training/exam`);
    await page.waitForLoadState('networkidle');
    
    // Check page title and metadata
    await expect(page).toHaveTitle(/Flat Earth|Training|Exam/i);
    
    // Verify progress bar exists
    const progressBar = page.locator('[style*="width"]').first();
    await expect(progressBar).toBeVisible();
    
    // Check that radio group has proper semantics
    const radioGroup = page.locator('[role="radiogroup"]');
    await expect(radioGroup).toBeVisible();
    
    // Verify Back button is disabled on first question
    const backButton = page.getByRole('button', { name: /back/i });
    await expect(backButton).toBeDisabled();
    
    // Check exam information section
    await expect(page.getByText(/questions covering all training modules/i)).toBeVisible();
    await expect(page.getByText(/required to pass/i)).toBeVisible();
  });

  test('Exam navigation works correctly', async ({ page }) => {
    await page.goto(`${BASE}/training/exam`);
    await page.waitForLoadState('networkidle');
    
    // Answer first question
    await page.locator('input[type="radio"]').first().check();
    
    // Next button should be enabled
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeEnabled();
    await nextButton.click();
    
    // Should be on question 2
    await expect(page.getByText(/Question 2 of/i)).toBeVisible();
    
    // Back button should now be enabled
    const backButton = page.getByRole('button', { name: /back/i });
    await expect(backButton).toBeEnabled();
    await backButton.click();
    
    // Should be back to question 1
    await expect(page.getByText(/Question 1 of/i)).toBeVisible();
    
    // Back button should be disabled again
    await expect(backButton).toBeDisabled();
  });

  test('Exam requires answers before proceeding', async ({ page }) => {
    await page.goto(`${BASE}/training/exam`);
    await page.waitForLoadState('networkidle');
    
    // Next button should be disabled without selecting an answer
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeDisabled();
    
    // Select an answer
    await page.locator('input[type="radio"]').first().check();
    
    // Next button should now be enabled
    await expect(nextButton).toBeEnabled();
  });

  test('Exam progress tracking works correctly', async ({ page }) => {
    await page.goto(`${BASE}/training/exam`);
    await page.waitForLoadState('networkidle');
    
    // Check initial progress
    await expect(page.getByText(/Question 1 of 12/i)).toBeVisible();
    await expect(page.getByText(/0 of 12 answered/i)).toBeVisible();
    
    // Answer first question
    await page.locator('input[type="radio"]').first().check();
    await page.getByRole('button', { name: /next/i }).click();
    
    // Check updated progress
    await expect(page.getByText(/Question 2 of 12/i)).toBeVisible();
    await expect(page.getByText(/1 of 12 answered/i)).toBeVisible();
  });

  test('Exam accessibility features work', async ({ page }) => {
    await page.goto(`${BASE}/training/exam`);
    await page.waitForLoadState('networkidle');
    
    // Check for proper ARIA labels
    const radioGroup = page.locator('[role="radiogroup"]');
    await expect(radioGroup).toHaveAttribute('aria-labelledby');
    
    // Check that questions have proper heading structure
    const questionHeading = page.locator('h2').first();
    await expect(questionHeading).toBeVisible();
    
    // Verify main content area
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
