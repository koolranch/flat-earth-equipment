import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('Training Hub displays modules and progress badges', async ({ page }) => {
  await page.goto(`${BASE}/training/simple-hub`);
  
  // Check page loads with proper title
  await expect(page.getByRole('heading', { name: /Training Hub/i })).toBeVisible();
  
  // Verify all 5 modules are listed
  await expect(page.getByText('Module 1')).toBeVisible();
  await expect(page.getByText('Module 2')).toBeVisible();
  await expect(page.getByText('Module 3')).toBeVisible();
  await expect(page.getByText('Module 4')).toBeVisible();
  await expect(page.getByText('Module 5')).toBeVisible();
  
  // Verify module titles are displayed
  await expect(page.getByText('Pre-Op: PPE & Controls')).toBeVisible();
  await expect(page.getByText('Daily Inspection (8-Point)')).toBeVisible();
  await expect(page.getByText('Balance & Load Handling')).toBeVisible();
  await expect(page.getByText('Hazard Hunt')).toBeVisible();
  await expect(page.getByText('Shutdown Sequence')).toBeVisible();
  
  // Verify all modules have Open buttons
  const openButtons = page.getByRole('link', { name: 'Open' });
  await expect(openButtons).toHaveCount(5);
  
  // Test that clicking an Open button navigates to the module
  await openButtons.first().click();
  await expect(page).toHaveURL(/\/training\/module-1/);
});

test('Training Hub shows completion badges when modules are completed', async ({ page }) => {
  // Set up localStorage with completed modules to test badge display
  await page.goto(`${BASE}/training/simple-hub`);
  
  // Simulate completed modules in localStorage
  await page.evaluate(() => {
    const progressData = {
      'module_1': { quiz: { score: 100, passed: true, at: Date.now() } },
      'module_3': { quiz: { score: 90, passed: true, at: Date.now() } }
    };
    localStorage.setItem('training:progress:v1', JSON.stringify(progressData));
  });
  
  // Reload to pick up the localStorage data
  await page.reload();
  
  // Wait for the component to load and process localStorage
  await page.waitForTimeout(100);
  
  // Check that completion badges appear for completed modules
  // Note: The exact selector might need adjustment based on the actual rendered output
  const completedBadges = page.getByText('✓ Completed');
  
  // We should see badges for modules 1 and 3 (as set in localStorage above)
  await expect(completedBadges).toHaveCount(2);
});
