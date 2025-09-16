import { test, expect } from '@playwright/test';

test('dashboard progress reflects completed modules', async ({ page }) => {
  await page.goto('/training?courseId=forklift_operator');
  
  // Wait for modules to load
  await page.getByRole('heading', { name: /Forklift Operator Training/i }).waitFor();
  
  // Read current percent text near the header progress bar
  const progressText = page.locator('[role="progressbar"]').getAttribute('aria-valuenow');
  const beforePercent = parseInt(await progressText || '0', 10);
  
  console.log(`Initial progress: ${beforePercent}%`);
  
  // Navigate to Module 1 and complete its flow
  const module1Link = page.getByRole('link', { name: /Module 1.*Start/i }).or(
    page.locator('a').filter({ hasText: /Module 1|Pre-Operation/i }).first()
  );
  
  if (await module1Link.isVisible()) {
    await module1Link.click();
    
    // Complete the OSHA tab
    await page.getByTestId('tab-osha').click();
    await page.getByRole('button', { name: /Mark OSHA Basics done/i }).click();
    
    // Complete the Practice tab
    await page.getByTestId('tab-practice').click();
    await page.getByRole('button', { name: /Mark Practice done/i }).click();
    
    // Complete the Flash Cards tab
    await page.getByTestId('tab-flash').click();
    await page.getByRole('button', { name: /Mark.*done/i }).click();
    
    // Take and pass the quiz
    await page.getByTestId('tab-quiz').click();
    await page.getByRole('button', { name: /Take quiz/i }).click();
    
    // Answer quiz questions (select first option for each)
    const quizModal = page.locator('[role="dialog"]');
    await expect(quizModal).toBeVisible();
    
    // Answer questions until quiz is complete
    let questionCount = 0;
    while (questionCount < 10) { // Safety limit
      const nextButton = page.getByRole('button', { name: /Next|Finish/i });
      if (await nextButton.isVisible()) {
        // Select first answer option
        const firstOption = page.locator('button').filter({ hasText: /^[A-D]\./ }).first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
        }
        await nextButton.click();
        questionCount++;
      } else {
        break;
      }
    }
    
    // Close quiz modal and return to dashboard
    const closeButton = page.getByRole('button', { name: /Close|Back to course/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
    
    // Navigate back to training dashboard
    await page.goto('/training?courseId=forklift_operator');
    await page.waitForTimeout(1000); // Allow progress to update
    
    // Verify percent increased
    const afterProgressText = page.locator('[role="progressbar"]').getAttribute('aria-valuenow');
    const afterPercent = parseInt(await afterProgressText || '0', 10);
    
    console.log(`Progress after Module 1: ${afterPercent}%`);
    
    // Should increase by approximately 20% (1/5 modules = 20%)
    expect(afterPercent).toBeGreaterThanOrEqual(beforePercent + 15);
  } else {
    console.log('Module 1 link not found, skipping completion test');
  }
});
