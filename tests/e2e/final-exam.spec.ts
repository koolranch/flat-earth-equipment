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
             document.body.innerText.toLowerCase().includes('training') ||
             document.body.innerText.toLowerCase().includes('dashboard');
    }, { timeout: 60000 });
    
    console.log('Login detected, continuing with test...');
  }
}

async function answerMCQ(page: any, text: string) { 
  await page.getByText(text, { exact: false }).first().click(); 
}

test('Final exam — pass flow', async ({ page }) => {
  // Sign in first
  await signIn(page);
  
  await page.goto(`${BASE}/final-exam`);
  
  // Wait for exam to load
  await page.waitForSelector('h1:has-text("Final exam")', { timeout: 10000 });

  // Q1 blind corner: horn & slow
  await answerMCQ(page, 'horn'); 
  await page.getByRole('button', { name: /check/i }).click(); 
  await page.getByRole('button', { name: /next/i }).click();
  
  // Q2 seat belt required
  await answerMCQ(page, 'Required whenever'); 
  await page.getByRole('button', { name: /check/i }).click(); 
  await page.getByRole('button', { name: /next/i }).click();
  
  // Q3 load low & back
  await answerMCQ(page, 'Low with mast'); 
  await page.getByRole('button', { name: /check/i }).click(); 
  await page.getByRole('button', { name: /next/i }).click();
  
  // Q4 numeric ~2400
  await page.getByLabel(/Answer/).fill('2400'); 
  await page.getByRole('button', { name: /check/i }).click(); 
  await page.getByRole('button', { name: /next/i }).click();
  
  // Q5 numeric ~2000
  await page.getByLabel(/Answer/).fill('2000'); 
  await page.getByRole('button', { name: /check/i }).click(); 
  await page.getByRole('button', { name: /next/i }).click();
  
  // Q6 hotspot grid choose B
  await page.getByRole('button', { name: 'B' }).click(); 
  await page.getByRole('button', { name: /check/i }).click(); 
  await page.getByRole('button', { name: /next/i }).click();
  
  // Q7 leak => stop-work
  await answerMCQ(page, 'Stop-work'); 
  await page.getByRole('button', { name: /check/i }).click(); 
  await page.getByRole('button', { name: /next/i }).click();
  
  // Q8 ramp => upgrade
  await answerMCQ(page, 'upgrade'); 
  await page.getByRole('button', { name: /check/i }).click(); 
  await page.getByRole('button', { name: /next/i }).click();
  
  // Q9 hotspot C
  await page.getByRole('button', { name: 'C' }).click(); 
  await page.getByRole('button', { name: /check/i }).click(); 
  await page.getByRole('button', { name: /next/i }).click();
  
  // Q10 data plate => do not operate
  await answerMCQ(page, 'Do not operate'); 
  await page.getByRole('button', { name: /check/i }).click(); 
  await page.getByRole('button', { name: /next/i }).click();
  
  // Q11 forks lowered
  await answerMCQ(page, 'lowered'); 
  await page.getByRole('button', { name: /check/i }).click(); 
  await page.getByRole('button', { name: /next/i }).click();
  
  // Q12 LPG close valve
  await answerMCQ(page, 'Close LPG'); 
  await page.getByRole('button', { name: /check/i }).click();

  await page.getByRole('button', { name: /finish/i }).click();
  
  // Verify passing results
  await expect(page.getByText(/Passed/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /View certificate/i })).toBeVisible();
});

test('Final exam — navigation and progress', async ({ page }) => {
  // Sign in first
  await signIn(page);
  
  await page.goto(`${BASE}/final-exam`);
  
  // Wait for exam to load
  await page.waitForSelector('h1:has-text("Final exam")', { timeout: 10000 });
  
  // Check progress indicator shows 1/12
  await expect(page.getByText('1 / 12')).toBeVisible();
  
  // Answer first question and navigate
  await answerMCQ(page, 'horn');
  await page.getByRole('button', { name: /check/i }).click();
  await page.getByRole('button', { name: /next/i }).click();
  
  // Check progress updated to 2/12
  await expect(page.getByText('2 / 12')).toBeVisible();
  
  // Test back navigation
  await page.getByRole('button', { name: /back/i }).click();
  await expect(page.getByText('1 / 12')).toBeVisible();
  
  // Go forward again
  await page.getByRole('button', { name: /next/i }).click();
  await expect(page.getByText('2 / 12')).toBeVisible();
});
