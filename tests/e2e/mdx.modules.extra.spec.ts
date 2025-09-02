import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

const slugs = [
  'stability-and-load-handling',
  'safe-operation-and-hazards',
  'shutdown-and-parking'
];

for (const slug of slugs){
  test(`MDX module renders: ${slug}`, async ({ page }) => {
    await page.goto(`${BASE}/training/modules/${slug}`);
    
    // Wait for page to load
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Look for some interactive element (button, input, or canvas from demos)
    const anyInteractive = page.locator('button, input, canvas').first();
    await expect(anyInteractive).toBeVisible();
    
    // Verify MDX content is rendered (objectives should be present)
    await expect(page.getByText('Objectives')).toBeVisible();
    
    // Check for sticky header with Resume button
    await expect(page.locator('a').filter({ hasText: 'Resume' })).toBeVisible();
    
    console.log(`✅ ${slug} - page loaded with interactive elements`);
  });
}
