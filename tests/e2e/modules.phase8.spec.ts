import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function signIn(page: any) {
  // Navigate to login page or check if already signed in
  await page.goto(`${BASE}/login`);
  
  // Wait for either the login form or a redirect if already logged in
  await page.waitForTimeout(2000);
  
  // Check if we're already logged in by looking for dashboard/training elements
  const isLoggedIn = await page.getByText(/training|dashboard|module/i).isVisible().catch(() => false);
  
  if (!isLoggedIn) {
    // If login form is present, wait for manual login
    console.log('Please sign in manually when prompted...');
    
    // Wait for successful login (look for redirect or training-related content)
    await page.waitForFunction(() => {
      return window.location.pathname !== '/login' || 
             document.body.textContent?.includes('training') ||
             document.body.textContent?.includes('dashboard');
    }, { timeout: 60000 }); // 60 seconds for manual login
    
    console.log('Login detected, continuing with tests...');
  }
}

async function passQuiz(page: any) {
  // Strategy: click buttons containing keywords from our seeded correct answers
  for (let i = 0; i < 6; i++) {
    // Wait for quiz question to load
    await page.waitForSelector('button:has-text("Take Quiz")', { timeout: 5000 }).catch(() => {});
    
    // Click "Take Quiz" if it's the initial state
    const takeQuizBtn = page.getByRole('button', { name: /take quiz/i });
    if (await takeQuizBtn.isVisible().catch(() => false)) {
      await takeQuizBtn.click();
      await page.waitForTimeout(1000);
    }

    // Look for quiz question buttons
    const buttons = await page.getByRole('button').all();
    
    // Keywords from our seeded correct answers for M1 and M2
    const correctAnswerKeywords = [
      'Lowered to the floor',
      'Required whenever operating', 
      'Stop-work: tag out and report',
      'Do not operate until fixed',
      'PPE on → brake set → forks down',
      'Stop and tag the truck',
      'Battery/LP fastened and connections tight',
      'Every shift, during inspection',
      'Report and remove from service',
      'Replace or service before use'
    ];
    
    let clicked = false;
    
    // Try to find and click the correct answer
    for (const keyword of correctAnswerKeywords) {
      for (const button of buttons) {
        const text = await button.textContent().catch(() => '');
        if (text && text.includes(keyword)) {
          await button.click();
          clicked = true;
          break;
        }
      }
      if (clicked) break;
    }
    
    // Fallback: click first available button if no match found
    if (!clicked && buttons.length > 0) {
      await buttons[0].click();
    }
    
    // Wait a bit between clicks
    await page.waitForTimeout(500);
    
    // Check if we've completed the quiz
    const passedText = page.getByText(/Passed/i);
    if (await passedText.isVisible().catch(() => false)) {
      break;
    }
  }
}

test.describe('M1–M2 E2E Flow', () => {
  test('Module 1 → complete PPE demo → pass quiz → see Next module CTA', async ({ page }) => {
    // Sign in first
    await signIn(page);
    
    // Navigate to Module 1 overview page
    await page.goto(`${BASE}/module/1`);
    
    // Click Start Demo to go to the PPE demo
    await expect(page.getByRole('link', { name: /start demo/i })).toBeVisible();
    await page.getByRole('link', { name: /start demo/i }).click();
    
    // Complete PPE demo in strict order
    await page.waitForSelector('button:has-text("Hi-vis vest")', { timeout: 10000 });
    
    // PPE sequence: Hi-vis vest → Hard hat → Parking brake → Lower forks → Mark complete
    await page.getByRole('button', { name: /hi-vis vest/i }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: /hard hat/i }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: /parking brake/i }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: /lower forks/i }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: /mark complete/i }).click();
    
    // Navigate back to module overview to access quiz
    await page.goto(`${BASE}/module/1`);
    
    // Start the quiz
    await expect(page.getByRole('link', { name: /start quiz/i })).toBeVisible();
    await page.getByRole('link', { name: /start quiz/i }).click();
    
    // Complete the quiz
    await passQuiz(page);
    
    // Verify quiz passed and Next module CTA is visible
    await expect(page.getByText(/Passed/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /Next module/i })).toBeVisible();
  });

  test('Module 2 → complete 8-point inspection → pass quiz → see Next module CTA', async ({ page }) => {
    // Sign in first
    await signIn(page);
    
    // Navigate to Module 2 overview page  
    await page.goto(`${BASE}/module/2`);
    
    // Click Start Demo to go to the 8-point inspection demo
    await expect(page.getByRole('link', { name: /start demo/i })).toBeVisible();
    await page.getByRole('link', { name: /start demo/i }).click();
    
    // Complete 8-point inspection by clicking inspection hotspots
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Helper function to click inspection buttons if they exist
    const tryClick = async (label: RegExp) => {
      const button = page.getByRole('button', { name: label });
      if (await button.isVisible().catch(() => false)) {
        await button.click();
        await page.waitForTimeout(300);
      }
    };
    
    // Click various inspection points (order doesn't matter for 8-point)
    await tryClick(/tires/i);
    await tryClick(/forks/i);
    await tryClick(/lift chains/i);
    await tryClick(/hydraulic/i);
    await tryClick(/controls/i);
    await tryClick(/battery|lp/i);
    await tryClick(/horn|lights/i);
    await tryClick(/seat belt/i);
    
    // Mark inspection complete
    const completeBtn = page.getByRole('button', { name: /mark complete/i });
    if (await completeBtn.isVisible().catch(() => false)) {
      await completeBtn.click();
    }
    
    // Navigate back to module overview to access quiz
    await page.goto(`${BASE}/module/2`);
    
    // Start the quiz
    await expect(page.getByRole('link', { name: /start quiz/i })).toBeVisible();
    await page.getByRole('link', { name: /start quiz/i }).click();
    
    // Complete the quiz
    await passQuiz(page);
    
    // Verify quiz passed and Next module CTA is visible
    await expect(page.getByText(/Passed/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /Next module/i })).toBeVisible();
  });
  
  test('Module 1 to Module 2 progression flow', async ({ page }) => {
    // Sign in first
    await signIn(page);
    
    // Start with Module 1
    await page.goto(`${BASE}/module/1`);
    
    // Complete Module 1 quiz (skip demo for faster test)
    await page.getByRole('link', { name: /start quiz/i }).click();
    await passQuiz(page);
    
    // Verify passed and click Next module
    await expect(page.getByText(/Passed/i)).toBeVisible({ timeout: 10000 });
    const nextModuleBtn = page.getByRole('link', { name: /Next module/i });
    await expect(nextModuleBtn).toBeVisible();
    
    // Click Next module and verify we're on Module 2
    await nextModuleBtn.click();
    await expect(page).toHaveURL(/\/module\/2/);
    
    // Verify Module 2 page elements are present
    await expect(page.getByText(/Check your knowledge/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /start quiz/i })).toBeVisible();
  });
});
