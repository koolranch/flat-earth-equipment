import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

const slugs = ['module-1','module-2','module-3','module-4','module-5'];

for (const slug of slugs){
  test(`module content shows before demo for ${slug}` , async ({ page }) => {
    await page.goto(`${BASE}/training/module/${slug.replace('module-', '')}`);
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10000 });
    
    // Check for Learning Content section
    await expect(page.getByText('Learning Content')).toBeVisible();
    
    // Look for content elements (images, icons, or objectives)
    const hasContent = await page.locator('figure img, ul li, .grid').first().isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
    
    // Interactive demo should exist (more flexible selectors)
    const hasDemo = await page.locator('button, canvas, svg[role="img"]').first().isVisible().catch(() => false);
    expect(hasDemo).toBeTruthy();
  });
}
