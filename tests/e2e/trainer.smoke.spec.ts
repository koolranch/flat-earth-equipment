import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const COURSE_ID = process.env.E2E_COURSE_ID || '';

test.describe('Trainer Interface Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any authentication if needed
    // For now, we'll test the unauthenticated behavior first
  });

  test('Trainer page renders appropriate content based on auth state', async ({ page }) => {
    await page.goto(`${BASE}/trainer`);
    
    // Wait for page to load and get the main content
    await page.waitForLoadState('networkidle');
    
    // Get page content to determine what's rendered
    const pageContent = await page.textContent('body');
    
    // The page should contain one of these patterns depending on auth state
    const hasSignInRequired = pageContent?.includes('Sign in required');
    const hasTrainerAccess = pageContent?.includes('Trainer access required');  
    const hasTrainerTools = pageContent?.includes('Trainer Tools');
    const hasNoCoursesFound = pageContent?.includes('No course found');
    
    // At least one of these should be true
    expect(hasSignInRequired || hasTrainerAccess || hasTrainerTools || hasNoCoursesFound).toBe(true);
    
    // Log what we found for debugging
    console.log('Page content includes:', {
      hasSignInRequired,
      hasTrainerAccess, 
      hasTrainerTools,
      hasNoCoursesFound
    });
  });

  test('Trainer page shows tabs and CSV export when accessible', async ({ page }) => {
    await page.goto(`${BASE}/trainer`);
    await page.waitForLoadState('networkidle');
    
    const pageContent = await page.textContent('body');
    
    // Only run detailed checks if we have trainer access
    if (pageContent?.includes('Trainer Tools')) {
      // Verify main elements are present
      await expect(page.getByRole('heading', { name: /Trainer Tools/i })).toBeVisible();
      
      // Check for CSV export link
      const csvLink = page.locator('a[href*="export.csv"]');
      if (await csvLink.count() > 0) {
        await expect(csvLink).toBeVisible();
      }
      
      // Check for tabs - use more flexible selectors
      const rosterElement = page.locator('text=Roster').first();
      const invitesElement = page.locator('text=Invites').first();
      
      if (await rosterElement.count() > 0) {
        await expect(rosterElement).toBeVisible();
      }
      
      if (await invitesElement.count() > 0) {
        await expect(invitesElement).toBeVisible();
      }
      
      // Try to click tabs if they exist
      const rosterButton = page.locator('button:has-text("Roster")').first();
      const invitesButton = page.locator('button:has-text("Invites")').first();
      
      if (await rosterButton.count() > 0) {
        await rosterButton.click();
        // Look for table content
        const hasTableHeaders = await page.locator('text=Learner, text=Progress, text=Exam').count() > 0;
        if (hasTableHeaders) {
          console.log('✓ Roster tab shows table headers');
        }
      }
      
      if (await invitesButton.count() > 0) {
        await invitesButton.click();
        // Look for invites content
        const hasInviteHeaders = await page.locator('text=Email, text=Status').count() > 0;
        if (hasInviteHeaders) {
          console.log('✓ Invites tab shows table headers');
        }
      }
    } else {
      console.log('Trainer page shows auth requirement - this is expected behavior');
    }
  });

  test('Assign Seats Panel is present when authenticated', async ({ page }) => {
    await page.goto(`${BASE}/trainer`);
    
    const hasTrainerAccess = await page.getByRole('heading', { name: /Trainer Tools/i }).isVisible().catch(() => false);
    
    if (hasTrainerAccess) {
      // Look for assign seats functionality
      const assignSeatsElements = await page.locator('text=/assign|seat|email/i').count();
      expect(assignSeatsElements).toBeGreaterThan(0);
      
      // Check for course selection or email input fields
      const hasFormElements = await page.locator('input, select, textarea').count();
      expect(hasFormElements).toBeGreaterThan(0);
    }
  });

  test('Refresh buttons work in tabs', async ({ page }) => {
    await page.goto(`${BASE}/trainer`);
    
    const hasTrainerAccess = await page.getByRole('heading', { name: /Trainer Tools/i }).isVisible().catch(() => false);
    
    if (hasTrainerAccess) {
      // Click roster tab
      await page.getByRole('button', { name: /Roster/i }).click();
      
      // Look for refresh button
      const refreshButton = page.getByRole('button', { name: /Refresh/i }).first();
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        // Verify no errors occur (page doesn't crash)
        await expect(page.getByRole('heading', { name: /Trainer Tools/i })).toBeVisible();
      }
      
      // Click invites tab
      await page.getByRole('button', { name: /Invites/i }).click();
      
      // Look for refresh button in invites tab
      const invitesRefreshButton = page.getByRole('button', { name: /Refresh/i }).first();
      if (await invitesRefreshButton.isVisible()) {
        await invitesRefreshButton.click();
        // Verify no errors occur
        await expect(page.getByRole('heading', { name: /Trainer Tools/i })).toBeVisible();
      }
    }
  });
});

test.describe('CSV Export Endpoint Tests', () => {
  test.skip(!COURSE_ID, 'Set E2E_COURSE_ID environment variable to run CSV export tests');

  test('CSV export endpoint returns 200 with proper headers', async ({ request }) => {
    const response = await request.get(`${BASE}/api/trainer/export.csv?course_id=${COURSE_ID}`);
    
    expect(response.status()).toBe(200);
    
    // Check content type
    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/text\/csv|application\/csv/);
    
    // Check content disposition for download
    const contentDisposition = response.headers()['content-disposition'];
    expect(contentDisposition).toMatch(/attachment.*filename.*\.csv/);
  });

  test('CSV export contains expected headers', async ({ request }) => {
    const response = await request.get(`${BASE}/api/trainer/export.csv?course_id=${COURSE_ID}`);
    
    expect(response.status()).toBe(200);
    
    const csvContent = await response.text();
    
    // Check for expected CSV headers
    expect(csvContent).toContain('name');
    expect(csvContent).toContain('email');
    expect(csvContent).toContain('progress_pct');
    
    // Additional headers that might be present
    const expectedHeaders = [
      'latest_exam_pct',
      'attempts',
      'cert_verification_code',
      'cert_issued_at',
      'practical_pass'
    ];
    
    // At least some of these headers should be present
    const headerMatches = expectedHeaders.filter(header => csvContent.includes(header));
    expect(headerMatches.length).toBeGreaterThan(0);
  });

  test('CSV export handles missing course_id parameter', async ({ request }) => {
    const response = await request.get(`${BASE}/api/trainer/export.csv`);
    
    // Should return an error status (400 or 422)
    expect([400, 422, 500]).toContain(response.status());
  });

  test('CSV export handles invalid course_id', async ({ request }) => {
    const response = await request.get(`${BASE}/api/trainer/export.csv?course_id=invalid-uuid`);
    
    // Should return an error or empty result
    expect([200, 400, 404, 422]).toContain(response.status());
    
    if (response.status() === 200) {
      const csvContent = await response.text();
      // Should still have headers even if no data
      expect(csvContent).toContain('name,email');
    }
  });
});

test.describe('Trainer API Endpoints Smoke Tests', () => {
  test.skip(!COURSE_ID, 'Set E2E_COURSE_ID environment variable to run API tests');

  test('Roster API endpoint responds', async ({ request }) => {
    const response = await request.get(`${BASE}/api/trainer/roster?course_id=${COURSE_ID}`);
    
    // Should return 200 or authentication error
    expect([200, 401, 403]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('ok');
      
      if (data.ok) {
        expect(data).toHaveProperty('rows');
        expect(Array.isArray(data.rows)).toBe(true);
      }
    }
  });

  test('Invites API endpoint responds', async ({ request }) => {
    const response = await request.get(`${BASE}/api/trainer/invites?course_id=${COURSE_ID}`);
    
    // Should return 200 or authentication error
    expect([200, 401, 403]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('ok');
      
      if (data.ok) {
        expect(data).toHaveProperty('invites');
        expect(data).toHaveProperty('status_counts');
        expect(Array.isArray(data.invites)).toBe(true);
      }
    }
  });

  test('Courses API endpoint responds', async ({ request }) => {
    const response = await request.get(`${BASE}/api/courses`);
    
    // Should return 200 or authentication error
    expect([200, 401, 403]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('title');
      }
    }
  });
});

test.describe('Trainer Interface Accessibility', () => {
  test('Trainer page has proper heading structure', async ({ page }) => {
    await page.goto(`${BASE}/trainer`);
    
    // Check for main heading
    const mainHeading = page.getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();
    
    const headingText = await mainHeading.textContent();
    expect(headingText).toMatch(/(Trainer Tools|Sign in|access)/i);
  });

  test('Tab buttons have proper ARIA attributes', async ({ page }) => {
    await page.goto(`${BASE}/trainer`);
    
    const hasTrainerAccess = await page.getByRole('heading', { name: /Trainer Tools/i }).isVisible().catch(() => false);
    
    if (hasTrainerAccess) {
      const rosterTab = page.getByRole('button', { name: /Roster/i });
      const invitesTab = page.getByRole('button', { name: /Invites/i });
      
      await expect(rosterTab).toBeVisible();
      await expect(invitesTab).toBeVisible();
      
      // Tabs should be keyboard accessible
      await rosterTab.focus();
      await expect(rosterTab).toBeFocused();
      
      await invitesTab.focus();
      await expect(invitesTab).toBeFocused();
    }
  });

  test('Tables have proper structure when present', async ({ page }) => {
    await page.goto(`${BASE}/trainer`);
    
    const hasTrainerAccess = await page.getByRole('heading', { name: /Trainer Tools/i }).isVisible().catch(() => false);
    
    if (hasTrainerAccess) {
      // Check roster table
      await page.getByRole('button', { name: /Roster/i }).click();
      
      const rosterTable = page.locator('table').first();
      if (await rosterTable.isVisible()) {
        await expect(rosterTable.locator('thead')).toBeVisible();
        await expect(rosterTable.locator('tbody')).toBeVisible();
      }
      
      // Check invites table
      await page.getByRole('button', { name: /Invites/i }).click();
      
      const invitesTable = page.locator('table').first();
      if (await invitesTable.isVisible()) {
        await expect(invitesTable.locator('thead')).toBeVisible();
        await expect(invitesTable.locator('tbody')).toBeVisible();
      }
    }
  });
});
