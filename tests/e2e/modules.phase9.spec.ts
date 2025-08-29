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

async function getEvents(page: any) { 
  return await page.evaluate(() => (window as any).__qaEvents || []); 
}

async function passQuizWithKeywords(page: any, kws: string[]) {
  // Strategy: for each quiz question, click the first option containing any keyword
  for (let i = 0; i < 8; i++) {
    // Wait for quiz question to load
    await page.waitForSelector('button:has-text("Take Quiz")', { timeout: 5000 }).catch(() => {});
    
    // Click "Take Quiz" if it's the initial state
    const takeQuizBtn = page.getByRole('button', { name: /take quiz/i });
    if (await takeQuizBtn.isVisible().catch(() => false)) {
      await takeQuizBtn.click();
      await page.waitForTimeout(1000);
    }

    // Look for quiz question buttons
    const btns = await page.getByRole('button').all();
    let clicked = false;
    
    // Try to find and click button with matching keywords
    for (const kw of kws) {
      for (const b of btns) { 
        const t = (await b.textContent()) || ''; 
        if (t.includes(kw)) { 
          await b.click(); 
          clicked = true; 
          break; 
        } 
      }
      if (clicked) break;
    }
    
    // Fallback: click first available button if no match found
    if (!clicked && btns.length) await btns[0].click();
    
    // Wait a bit between clicks
    await page.waitForTimeout(500);
    
    // Check if we've completed the quiz
    const passedText = page.getByText(/Passed/i);
    if (await passedText.isVisible().catch(() => false)) {
      break;
    }
  }
}

test.describe('Modules 3–5 E2E Flow', () => {
  test('M3 Balance: complete load capacity demo and pass quiz', async ({ page }) => {
    // Sign in first
    await signIn(page);
    
    // Navigate to Module 3 overview page
    await page.goto(`${BASE}/module/3`);
    
    // Click Start Demo to go to the balance/load capacity demo
    await expect(page.getByRole('link', { name: /start demo/i })).toBeVisible();
    await page.getByRole('link', { name: /start demo/i }).click();
    
    // Complete balance demo by ensuring SAFE load (lower weight via ArrowLeft)
    await page.waitForSelector('input, [role="slider"]', { timeout: 10000 });
    
    // Find and adjust weight control to ensure safe load
    const weight = page.getByLabel(/Load weight/i).or(page.locator('input[type="range"]')).first();
    if (await weight.isVisible().catch(() => false)) {
      await weight.focus();
      // Lower weight significantly to ensure safe operation
      for (let i = 0; i < 50; i++) await page.keyboard.press('ArrowLeft');
    }
    
    // Mark demo complete
    const completeBtn = page.getByRole('button', { name: /mark complete/i });
    if (await completeBtn.isVisible().catch(() => false)) {
      await completeBtn.click();
    }
    
    // Navigate back to module overview to access quiz
    await page.goto(`${BASE}/module/3`);
    
    // Start the quiz
    await expect(page.getByRole('link', { name: /start quiz/i })).toBeVisible();
    await page.getByRole('link', { name: /start quiz/i }).click();
    
    // Pass quiz using Module 3 keywords
    await passQuizWithKeywords(page, ['Decreases', 'Low with mast', 'reverse', 'Inside', 'Drop below', 'Slow down']);
    
    // Verify quiz passed
    await expect(page.getByText(/Passed/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /Next module/i })).toBeVisible();
  });

  test('M4 Hazard Hunt: complete hazard spotting demo and pass quiz', async ({ page }) => {
    // Sign in first
    await signIn(page);
    
    // Navigate to Module 4 overview page
    await page.goto(`${BASE}/module/4`);
    
    // Click Start Demo to go to the hazard hunt demo
    await expect(page.getByRole('link', { name: /start demo/i })).toBeVisible();
    await page.getByRole('link', { name: /start demo/i }).click();
    
    // Complete hazard hunt by clicking 6 hazards
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Click available hazard buttons (typically need 6 for completion)
    for (let k = 0; k < 8; k++) {
      const buttons = await page.getByRole('button').all();
      let foundHazard = false;
      
      for (const b of buttons) { 
        if (!(await b.isDisabled().catch(() => false))) { 
          const text = await b.textContent().catch(() => '');
          // Look for hazard-related buttons, avoid navigation/completion buttons
          if (text && !text.includes('complete') && !text.includes('restart')) {
            await b.click(); 
            foundHazard = true;
            await page.waitForTimeout(300);
            break; 
          }
        } 
      }
      
      if (!foundHazard) break; // No more hazards to click
    }
    
    // Mark demo complete
    const completeBtn = page.getByRole('button', { name: /mark complete/i });
    if (await completeBtn.isVisible().catch(() => false)) {
      await completeBtn.click();
    }
    
    // Navigate back to module overview to access quiz
    await page.goto(`${BASE}/module/4`);
    
    // Start the quiz
    await expect(page.getByRole('link', { name: /start quiz/i })).toBeVisible();
    await page.getByRole('link', { name: /start quiz/i }).click();
    
    // Pass quiz using Module 4 keywords
    await passQuizWithKeywords(page, ['horn', 'Yield', 'Stop-work', 'upgrade', 'PPE', 'clear']);
    
    // Verify quiz passed
    await expect(page.getByText(/Passed/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /Next module/i })).toBeVisible();
  });

  test('M5 Shutdown: complete shutdown sequence demo and pass quiz', async ({ page }) => {
    // Sign in first
    await signIn(page);
    
    // Navigate to Module 5 overview page
    await page.goto(`${BASE}/module/5`);
    
    // Click Start Demo to go to the shutdown sequence demo
    await expect(page.getByRole('link', { name: /start demo/i })).toBeVisible();
    await page.getByRole('link', { name: /start demo/i }).click();
    
    // Complete shutdown sequence in proper order
    await page.waitForSelector('button', { timeout: 10000 });
    
    const shutdownOrder = [
      'Shift to neutral',
      'Wheel straight', 
      'Set parking brake',
      'Lower forks',
      'Key off'
    ];
    
    // Execute shutdown sequence in order
    for (const label of shutdownOrder) { 
      const btn = page.getByRole('button', { name: new RegExp(label, 'i') });
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }
    
    // Complete electric-specific steps (stay on Electric default)
    const plugChargerBtn = page.getByRole('button', { name: /Plug in charger/i });
    if (await plugChargerBtn.isVisible().catch(() => false)) {
      await plugChargerBtn.click();
      await page.waitForTimeout(300);
    }
    
    const wheelChockBtn = page.getByRole('button', { name: /Wheel chock/i });
    if (await wheelChockBtn.isVisible().catch(() => false)) {
      await wheelChockBtn.click();
      await page.waitForTimeout(300);
    }
    
    // Mark demo complete
    const completeBtn = page.getByRole('button', { name: /mark complete/i });
    if (await completeBtn.isVisible().catch(() => false)) {
      await completeBtn.click();
    }
    
    // Navigate back to module overview to access quiz
    await page.goto(`${BASE}/module/5`);
    
    // Start the quiz
    await expect(page.getByRole('link', { name: /start quiz/i })).toBeVisible();
    await page.getByRole('link', { name: /start quiz/i }).click();
    
    // Pass quiz using Module 5 keywords
    await passQuizWithKeywords(page, ['neutral', 'lowered', 'Close LPG', 'Plug in', 'Out of traffic', 'grade']);
    
    // Verify quiz passed and completion (last module returns to training hub)
    await expect(page.getByText(/Passed/i)).toBeVisible({ timeout: 10000 });
    // Module 5 is the last module, so it should show training hub link instead of Next module
    const nextLink = page.getByRole('link', { name: /Next module|training/i });
    await expect(nextLink).toBeVisible();
  });

  test('M3 to M4 to M5 progression flow', async ({ page }) => {
    // Sign in first
    await signIn(page);
    
    // Test Module 3 → Module 4 progression
    await page.goto(`${BASE}/module/3`);
    
    // Complete Module 3 quiz (skip demo for faster test)
    await page.getByRole('link', { name: /start quiz/i }).click();
    await passQuizWithKeywords(page, ['Decreases', 'Low with mast', 'reverse', 'Inside', 'Drop below', 'Slow down']);
    
    // Verify passed and click Next module
    await expect(page.getByText(/Passed/i)).toBeVisible({ timeout: 10000 });
    const nextModuleBtn = page.getByRole('link', { name: /Next module/i });
    await expect(nextModuleBtn).toBeVisible();
    
    // Click Next module and verify we're on Module 4
    await nextModuleBtn.click();
    await expect(page).toHaveURL(/\/module\/4/);
    
    // Complete Module 4 quiz
    await page.getByRole('link', { name: /start quiz/i }).click();
    await passQuizWithKeywords(page, ['horn', 'Yield', 'Stop-work', 'upgrade', 'PPE', 'clear']);
    
    // Verify passed and click Next module to Module 5
    await expect(page.getByText(/Passed/i)).toBeVisible({ timeout: 10000 });
    const nextToM5Btn = page.getByRole('link', { name: /Next module/i });
    await expect(nextToM5Btn).toBeVisible();
    
    // Click Next module and verify we're on Module 5
    await nextToM5Btn.click();
    await expect(page).toHaveURL(/\/module\/5/);
    
    // Verify Module 5 page elements are present
    await expect(page.getByText(/Check your knowledge/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /start quiz/i })).toBeVisible();
  });
});
