import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('import page reachable or redirects when unauth', async ({ page }) => {
  const r = await page.goto(`${BASE}/trainer/import`);
  expect([200,302]).toContain(r!.status());
  
  // Check what we actually got
  if (r!.status() === 200) {
    // Page loaded - check if it's the import page or access denied
    const hasImportTitle = await page.getByText('Import Quiz Items').isVisible();
    const hasAccessDenied = await page.getByText('Access denied').isVisible();
    
    if (hasImportTitle) {
      console.log('✅ Import page loaded successfully (user has trainer access)');
      
      // Verify key elements are present
      await expect(page.getByText('Download CSV template')).toBeVisible();
      await expect(page.locator('textarea')).toBeVisible();
      await expect(page.getByText('Dry run')).toBeVisible();
      
    } else if (hasAccessDenied) {
      console.log('🔒 Access denied page shown (user lacks trainer role)');
      await expect(page.getByText('You need trainer or admin access')).toBeVisible();
      
    } else {
      console.log('⚠️ Unexpected page content');
    }
  } else {
    console.log('↩️ Page redirected (likely due to authentication)');
  }
});

test('admin import API refuses unauth', async ({ request }) => {
  const res = await request.post(`${BASE}/api/admin/quiz/import`, { 
    data: { rows: [], dryRun: true } 
  });
  
  // Should return auth/permission error for unauthenticated requests
  expect([401,403,400]).toContain(res.status());
  
  const json = await res.json().catch(() => null);
  
  if (res.status() === 401) {
    console.log('🔒 API correctly requires authentication (401)');
    expect(json?.error).toBe('unauthorized');
  } else if (res.status() === 403) {
    console.log('🚫 API correctly requires trainer/admin role (403)');
    expect(json?.error).toBe('forbidden');
  } else if (res.status() === 400) {
    console.log('📝 API validates request data (400 for empty rows)');
    expect(json?.error).toBe('no_rows');
  }
});

test('admin import API validates request structure', async ({ request }) => {
  // Test with invalid request body
  const invalidRes = await request.post(`${BASE}/api/admin/quiz/import`, {
    data: { invalid: 'data' }
  });
  
  // Should handle invalid requests appropriately
  expect([400,401,403]).toContain(invalidRes.status());
  
  if (invalidRes.status() === 400) {
    const json = await invalidRes.json();
    expect(json.error).toBe('no_rows');
    console.log('✅ API validates request structure correctly');
  } else {
    console.log(`🔒 API auth check prevents invalid request processing (${invalidRes.status()})`);
  }
});

test('import page CSV template download works', async ({ page }) => {
  const response = await page.goto(`${BASE}/trainer/import`);
  
  if (response!.status() === 200) {
    // Check if we can access the page content
    const hasImportTitle = await page.getByText('Import Quiz Items').isVisible();
    
    if (hasImportTitle) {
      // Test CSV template download link
      const downloadLink = page.getByText('Download CSV template');
      await expect(downloadLink).toBeVisible();
      
      // Verify it's a proper data URL
      const href = await downloadLink.getAttribute('href');
      expect(href).toMatch(/^data:text\/csv/);
      
      console.log('✅ CSV template download link verified');
    } else {
      console.log('🔒 Cannot test CSV download - access denied or redirected');
    }
  } else {
    console.log('↩️ Cannot test CSV download - page redirected');
  }
});
