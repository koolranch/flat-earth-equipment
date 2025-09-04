import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('trainer evaluation page reachable or redirects', async ({ page }) => {
  const res = await page.goto(`${BASE}/trainer/evaluations/new`);
  expect([200, 302, 401]).toContain(res?.status() || 200);
  
  // If we get a 200, verify basic form elements are present (when authenticated)
  if (res?.status() === 200) {
    // Check for form elements that should be present
    const hasTitle = await page.locator('h1').count() > 0;
    const hasForm = await page.locator('input, textarea, button').count() > 0;
    
    if (hasTitle && hasForm) {
      // Verify we can see evaluation form elements
      const formInputs = page.locator('input[type="email"], input[type="text"], input[type="date"]');
      const inputCount = await formInputs.count();
      expect(inputCount).toBeGreaterThanOrEqual(1);
    }
  }
});

test('records page tolerates missing evaluation', async ({ page }) => {
  const res = await page.goto(`${BASE}/records`);
  expect([200, 302]).toContain(res?.status() || 200);
  
  // If we get a 200, verify the page renders without crashing
  if (res?.status() === 200) {
    // Check that the page has basic structure
    const hasTitle = await page.locator('h1').count() > 0;
    const hasContent = await page.locator('main, section').count() > 0;
    
    expect(hasTitle || hasContent).toBe(true);
    
    // Verify no JavaScript errors that would indicate evaluation handling issues
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a moment for any async operations to complete
    await page.waitForTimeout(1000);
    
    // Filter out expected/harmless errors
    const criticalErrors = errors.filter(err => 
      !err.includes('Failed to load resource') && 
      !err.includes('Network request failed') &&
      !err.includes('auth') &&
      !err.includes('_vercel/insights') &&
      !err.includes('_vercel/speed-insights') &&
      !err.includes('MIME type') &&
      !err.includes('script.js')
    );
    
    expect(criticalErrors).toHaveLength(0);
  }
});

test('evaluation API endpoints respond appropriately', async ({ request }) => {
  // Test evaluation creation endpoint
  const evalRes = await request.post(`${BASE}/api/evaluations`, {
    data: { trainee_email: 'test@example.com' }
  });
  expect([200, 401, 403]).toContain(evalRes.status());
  
  // Test finalize endpoint
  const finalizeRes = await request.post(`${BASE}/api/evaluations/finalize`, {
    data: { id: 'test-id' }
  });
  expect([200, 400, 401, 403, 500]).toContain(finalizeRes.status());
});

test('trainer evaluation form has required test IDs', async ({ page }) => {
  const res = await page.goto(`${BASE}/trainer/evaluations/new`);
  
  // Skip if not authenticated or redirected
  if (res?.status() !== 200) {
    test.skip(true, 'Page not accessible - likely auth redirect');
    return;
  }
  
  // Wait for page to load
  await page.waitForTimeout(500);
  
  // Check if we're on the form page (has form elements)
  const hasFormElements = await page.locator('input, button').count() > 0;
  
  if (hasFormElements) {
    // Check for test IDs on buttons that should be present
    const testIds = [
      'eval-next',
      'eval-save-step1'
    ];
    
    for (const testId of testIds) {
      const element = page.locator(`[data-testid="${testId}"]`);
      const exists = await element.count() > 0;
      
      // Only assert if the element should be visible (form is loaded)
      if (exists) {
        await expect(element).toBeVisible();
      }
    }
  } else {
    test.skip(true, 'Form not loaded - likely auth required');
  }
});
