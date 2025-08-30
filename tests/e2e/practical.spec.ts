import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ENR = process.env.TEST_ENROLLMENT_ID; // set this when running locally

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

test.skip(!ENR, 'TEST_ENROLLMENT_ID not set');

test('Practical evaluation — happy path', async ({ page }) => {
  // Sign in first
  await signIn(page);
  
  // Navigate directly to the practical evaluation form
  await page.goto(`${BASE}/practical/${ENR}/start`);
  
  // Wait for form to load
  await page.waitForSelector('h1:has-text("Supervisor Practical Evaluation")', { timeout: 10000 });
  
  // Fill evaluator information
  await page.getByLabel(/Supervisor name/i).fill('Casey Foreman');
  await page.getByLabel(/Title/i).fill('Warehouse Supervisor');
  await page.getByLabel(/Site\/location/i).fill('Dock A — Phoenix');
  
  // Date should be pre-filled, but we can verify it exists
  await expect(page.getByLabel(/Date/i)).toHaveValue(/\d{4}-\d{2}-\d{2}/);
  
  // Checklist — check all the boxes for a passing evaluation
  const labels = [
    'PPE on',
    'Forks down', 
    'Parking brake set',
    'Starts/stops smooth',
    'Slow controlled turns',
    'Horn at corners',
    'Load low, mast back',
    'Capacity respected',
    'Step complete'
  ];
  
  for (const l of labels) { 
    const el = page.getByLabel(new RegExp(l, 'i')); 
    if (await el.count()) {
      await el.first().check(); 
    }
  }
  
  // Ensure Pass is selected (should be default)
  await page.getByLabel(/Pass/i).check();
  
  // Add some notes
  await page.getByLabel(/Notes/i).fill('Excellent performance. Demonstrated all safety protocols correctly.');
  
  // Draw signature on canvas
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  
  const box = await canvas.boundingBox();
  if (box) {
    // Draw a simple signature pattern
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 20, box.y + box.height/2);
    await page.mouse.move(box.x + 40, box.y + box.height - 20);
    await page.mouse.up();
    
    // Wait a moment for signature to register
    await page.waitForTimeout(500);
  }
  
  // Verify Save button becomes enabled (should be disabled until signature is drawn)
  const saveBtn = page.getByRole('button', { name: /save evaluation/i });
  await expect(saveBtn).toBeEnabled();
  
  // Submit the evaluation
  await saveBtn.click();
  
  // Wait for submission to complete and verify success message
  await expect(page.getByText(/Evaluation saved/i)).toBeVisible({ timeout: 10000 });
  
  // Verify Records link is available
  await expect(page.getByRole('link', { name: /Go to Records/i })).toBeVisible();
});

test('Practical evaluation — form validation', async ({ page }) => {
  // Sign in first
  await signIn(page);
  
  // Navigate to practical evaluation form
  await page.goto(`${BASE}/practical/${ENR}/start`);
  
  // Wait for form to load
  await page.waitForSelector('h1:has-text("Supervisor Practical Evaluation")', { timeout: 10000 });
  
  // Verify Save button is initially disabled (no supervisor name or signature)
  const saveBtn = page.getByRole('button', { name: /save evaluation/i });
  await expect(saveBtn).toBeDisabled();
  
  // Add supervisor name but no signature - should still be disabled
  await page.getByLabel(/Supervisor name/i).fill('Test Supervisor');
  await expect(saveBtn).toBeDisabled();
  
  // Draw signature
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.move(box.x + 10, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + 50, box.y + 30);
    await page.mouse.up();
    await page.waitForTimeout(500);
  }
  
  // Now button should be enabled
  await expect(saveBtn).toBeEnabled();
  
  // Test Clear signature functionality
  await page.getByRole('button', { name: /Clear/i }).click();
  
  // Button should be disabled again after clearing signature
  await expect(saveBtn).toBeDisabled();
});
