import { test, expect } from '@playwright/test';

test('flashcards complete → quiz unlocked (DB source of truth)', async ({ page }) => {
  await page.goto('/training/module/1');
  
  // Navigate to flashcards tab
  await page.getByTestId('tab-flash').click();
  
  // Complete flashcard deck by going through all cards
  for (let i = 0; i < 10; i++) { // Adjust count based on actual module
    const revealButton = page.getByTestId('flashcard-reveal');
    const nextButton = page.getByTestId('flashcard-next');
    
    if (await revealButton.isVisible()) {
      await revealButton.click(); // Reveal answer
      await page.waitForTimeout(500); // Brief pause
    }
    
    if (await nextButton.isVisible()) {
      await nextButton.click(); // Next card
      await page.waitForTimeout(500); // Brief pause
    } else {
      break; // No more cards
    }
  }
  
  // Mark flashcards complete
  const completeButton = page.getByTestId('flashcard-complete');
  await expect(completeButton).toBeEnabled();
  await completeButton.click();
  
  // Navigate to quiz tab and verify it's unlocked
  await page.getByTestId('tab-quiz').click();
  await expect(page.getByTestId('take-quiz')).toBeEnabled();
  
  // Refresh page and verify state persists from DB
  await page.reload();
  await page.getByTestId('tab-quiz').click();
  await expect(page.getByTestId('take-quiz')).toBeEnabled();
});
