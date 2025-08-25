import { test, expect } from '@playwright/test';

const brands = ['jlg','genie','toyota','jcb','hyster'];

test.describe('Brand hubs smoke', () => {
  for (const b of brands){
    test(`/${b} hub tabs render`, async ({ page }) => {
      // Test serial lookup page
      await page.goto(`/brand/${b}/serial-lookup`);
      await expect(page.locator('text=Serial Number Lookup')).toBeVisible();
      
      // Test fault codes page
      await page.goto(`/brand/${b}/fault-codes`);
      await expect(page.locator('text=Fault Codes')).toBeVisible();
      
      // Test guide page
      await page.goto(`/brand/${b}/guide`);
      await expect(page.locator('text=Guide')).toBeVisible();
    });
    
    test(`/${b} hub has submission form`, async ({ page }) => {
      await page.goto(`/brand/${b}/serial-lookup`);
      await expect(page.locator('text=Help improve our')).toBeVisible();
      await expect(page.locator('button:has-text("Submit tip")')).toBeVisible();
    });
    
    test(`/${b} Spanish hub works`, async ({ page }) => {
      await page.goto(`/es/brand/${b}/serial-lookup`);
      await expect(page.locator('text=Búsqueda por número de serie')).toBeVisible();
    });
  }
  
  test('Submission form validation', async ({ page }) => {
    await page.goto('/brand/jlg/serial-lookup');
    
    // Try to submit without required details
    await page.click('button:has-text("Submit tip")');
    
    // Should show HTML5 validation for required textarea
    const detailsField = page.locator('textarea[name="details"]');
    await expect(detailsField).toHaveAttribute('required');
  });
});
