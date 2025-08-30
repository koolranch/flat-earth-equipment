import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

// If your local session is admin, set ADMIN_TEST=1 and ensure you are logged in
const IS_ADMIN = process.env.ADMIN_TEST === '1';

test.describe('Admin Access Control', () => {
  
  test('Admin roster gate', async ({ page }) => {
    await page.goto(`${BASE}/admin/roster`);
    
    if (IS_ADMIN) {
      // Admin users should see the roster interface
      await expect(page.getByRole('heading', { name: /Training Roster|Roster/i })).toBeVisible();
      
      // Should see admin-specific elements
      const exportButton = page.getByRole('link', { name: /Export CSV/i });
      if (await exportButton.count() > 0) {
        await expect(exportButton).toBeVisible();
      }
      
      // Should see filter form
      const filterForm = page.locator('form').first();
      if (await filterForm.count() > 0) {
        await expect(filterForm).toBeVisible();
      }
      
    } else {
      // Non-admin users should be redirected to login or dashboard
      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/dashboard');
      const hasAccessDenied = await page.getByText(/403|Admins only|Access denied|admin.required/i).count() > 0;
      
      expect(isRedirected || hasAccessDenied).toBeTruthy();
      
      // Should not see admin content
      const rosterHeading = page.getByRole('heading', { name: /Training Roster/i });
      await expect(rosterHeading).not.toBeVisible();
    }
  });

  test('Admin audit gate', async ({ page }) => {
    await page.goto(`${BASE}/admin/audit`);
    
    if (IS_ADMIN) {
      // Admin users should see the audit interface
      await expect(page.getByRole('heading', { name: /System Audit Log|Audit/i })).toBeVisible();
      
      // Should see audit table or empty state
      const auditTable = page.locator('table');
      const emptyState = page.getByText(/No audit entries found/i);
      
      // Either table or empty state should be visible
      const hasTable = await auditTable.count() > 0;
      const hasEmptyState = await emptyState.count() > 0;
      
      expect(hasTable || hasEmptyState).toBeTruthy();
      
    } else {
      // Non-admin users should be redirected to login or dashboard
      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/dashboard');
      const hasAccessDenied = await page.getByText(/403|Admins only|Access denied|admin.required/i).count() > 0;
      
      expect(isRedirected || hasAccessDenied).toBeTruthy();
      
      // Should not see audit content
      const auditHeading = page.getByRole('heading', { name: /System Audit Log/i });
      await expect(auditHeading).not.toBeVisible();
    }
  });

  test('Admin test-access page', async ({ page }) => {
    await page.goto(`${BASE}/admin/test-access`);
    
    if (IS_ADMIN) {
      // Admin users should see the test access page
      await expect(page.getByRole('heading', { name: /Admin Access Test/i })).toBeVisible();
      
      // Should see admin confirmation
      const adminConfirmed = page.getByText(/Admin Access Confirmed/i);
      await expect(adminConfirmed).toBeVisible();
      
    } else {
      // Non-admin users should be redirected or see access denied
      // They might be redirected to login or dashboard
      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/dashboard');
      const hasAccessDenied = await page.getByText(/403|Admins only|Access denied/i).count() > 0;
      
      expect(isRedirected || hasAccessDenied).toBeTruthy();
    }
  });

  test('Admin header link visibility', async ({ page }) => {
    await page.goto(`${BASE}/training`);
    
    // Look for admin link in header navigation
    const adminLink = page.getByRole('link', { name: /Admin/i }).filter({ hasText: 'Admin' });
    
    if (IS_ADMIN) {
      // Admin users should see the admin link
      if (await adminLink.count() > 0) {
        await expect(adminLink).toBeVisible();
        
        // Test that admin link works
        await adminLink.click();
        await expect(page.getByRole('heading', { name: /Admin|Training Roster/i })).toBeVisible();
      }
    } else {
      // Non-admin users should not see admin link
      await expect(adminLink).not.toBeVisible();
    }
  });

  test('Admin API endpoint protection', async ({ page }) => {
    // Test that admin API endpoints are protected
    const testEndpoint = `${BASE}/api/admin/test-guard`;
    
    const response = await page.request.get(testEndpoint);
    
    if (IS_ADMIN) {
      // Admin users should get successful response
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      
    } else {
      // Non-admin users should get 401 or 403
      expect([401, 403]).toContain(response.status());
      const data = await response.json();
      expect(data.error).toBeTruthy();
    }
  });

  test('CSV export endpoint protection', async ({ page }) => {
    // Test CSV export endpoint (without valid token)
    const exportEndpoint = `${BASE}/api/admin/roster/export?token=invalid-token`;
    
    const response = await page.request.get(exportEndpoint);
    
    // Should return 401 (unauthorized) or 403 (forbidden) for non-admin access
    expect([401, 403]).toContain(response.status());
    const data = await response.json();
    expect(data.error).toMatch(/Authentication required|Admin access required|Invalid export token|forbidden/i);
  });

});

test.describe('Admin Interface Functionality', () => {
  
  // Only run these tests if user is admin
  test.skip(!IS_ADMIN, 'Admin functionality tests require ADMIN_TEST=1');

  test('Admin layout and navigation', async ({ page }) => {
    await page.goto(`${BASE}/admin/roster`);
    
    // Should see admin layout elements
    await expect(page.getByRole('heading', { name: /Admin/i })).toBeVisible();
    
    // Should see navigation links
    const rosterLink = page.getByRole('link', { name: /Roster/i });
    const auditLink = page.getByRole('link', { name: /Audit/i });
    const serviceLink = page.getByRole('link', { name: /Service/i });
    
    await expect(rosterLink).toBeVisible();
    await expect(auditLink).toBeVisible();
    await expect(serviceLink).toBeVisible();
    
    // Test navigation between admin pages
    await auditLink.click();
    await expect(page.getByRole('heading', { name: /System Audit Log/i })).toBeVisible();
    
    await rosterLink.click();
    await expect(page.getByRole('heading', { name: /Training Roster/i })).toBeVisible();
  });

  test('Roster filtering functionality', async ({ page }) => {
    await page.goto(`${BASE}/admin/roster`);
    
    // Look for filter form
    const searchInput = page.getByPlaceholder(/Search name\/email\/user_id/i);
    const statusSelect = page.getByRole('combobox').filter({ hasText: /All Status|Status/ });
    const filterButton = page.getByRole('button', { name: /Filter/i });
    
    if (await searchInput.count() > 0) {
      // Test search functionality
      await searchInput.fill('test');
      await filterButton.click();
      
      // URL should update with search parameter
      await page.waitForTimeout(500);
      const url = page.url();
      expect(url).toContain('q=test');
    }
    
    if (await statusSelect.count() > 0) {
      // Test status filtering
      await statusSelect.selectOption('passed');
      await filterButton.click();
      
      // URL should update with status parameter
      await page.waitForTimeout(500);
      const url = page.url();
      expect(url).toContain('status=passed');
    }
  });

  test('Audit log display', async ({ page }) => {
    await page.goto(`${BASE}/admin/audit`);
    
    // Should see audit page elements
    await expect(page.getByRole('heading', { name: /System Audit Log/i })).toBeVisible();
    
    // Should see either audit table or empty state
    const auditTable = page.locator('table');
    const emptyState = page.getByText(/No audit entries found/i);
    
    const hasTable = await auditTable.count() > 0;
    const hasEmptyState = await emptyState.count() > 0;
    
    expect(hasTable || hasEmptyState).toBeTruthy();
    
    if (hasTable) {
      // If table exists, should have proper headers
      await expect(page.getByRole('columnheader', { name: /When/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Action/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Actor/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Notes/i })).toBeVisible();
    }
  });

});
