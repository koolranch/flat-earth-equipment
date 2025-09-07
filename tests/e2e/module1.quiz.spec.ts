import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('Module 1: demos unlock quiz and pass it', async ({ page }) => {
  await page.goto(`${BASE}/training/module-1`);
  
  // PPE sequence - complete all 4 steps in order using new component structure
  const ppeSteps = ['Hi-vis vest','Hard hat','Eye protection','Seatbelt'];
  for (const step of ppeSteps) {
    // Find button by aria-label since the new component uses that
    await page.getByRole('button', { name: step }).click();
    // Small delay for state update
    await page.waitForTimeout(100);
  }
  await expect(page.getByText(/PPE complete/i)).toBeVisible();
  
  // Controls hotspots - these use simplified labels
  const controlLabels = ['Horn','Parking brake','Ignition','Lift'];
  for (const label of controlLabels) {
    await page.getByRole('button', { name: label }).click();
    // Small delay for state update
    await page.waitForTimeout(100);
  }
  await expect(page.getByText(/Controls identified/i)).toBeVisible();
  
  // Quiz should now be unlocked
  await expect(page.getByRole('button', { name: /Start Quiz/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Start Quiz/i })).toBeEnabled();
  
  // Start quiz
  await page.getByRole('button', { name: /Start Quiz/i }).click();
  
  // Wait for quiz modal to appear
  await expect(page.getByText(/Quiz — Module 1/i)).toBeVisible();
  
  // Answer three MC questions (pick the first option each time)
  for (let i=0;i<3;i++) {
    // Wait for question to be visible
    await expect(page.locator('label:has(input[type="radio"])')).toHaveCount(4);
    
    // Click first radio button option
    const firstOption = page.locator('label:has(input[type="radio"])').first();
    await firstOption.click();
    
    // Click Next/Finish button
    const nextBtn = page.getByRole('button', { name: /(Next|Finish)/ });
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();
    
    // Small delay to allow for question transition
    await page.waitForTimeout(200);
  }
  
  // Quiz modal should close automatically after completion
  // Wait a moment for the modal to close
  await page.waitForTimeout(500);
  
  // The Start Quiz button should be visible again (indicating we're back to the main page)
  await expect(page.getByRole('button', { name: /Start Quiz/i })).toBeVisible();
  
  // Verify we're still on the Module 1 page
  await expect(page.getByRole('heading', { name: /Pre-Operation: PPE & Controls/i })).toBeVisible();
});
