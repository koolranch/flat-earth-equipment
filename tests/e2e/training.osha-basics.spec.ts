import { test, expect } from '@playwright/test';

test.describe('OSHA Basics Content', () => {
  test('Module 2 OSHA Basics shows all 8 inspection points', async ({ page }) => {
    // Navigate to Module 2
    await page.goto('/training/forklift-operator/module-2');
    
    // Click OSHA Basics tab (should be default, but ensure it's active)
    await page.click('[data-testid="tab-osha"]');
    
    // Wait for content to load
    await page.waitForSelector('text=OSHA Basics — 8-Point Inspection');
    
    // Assert we have the title
    await expect(page.locator('text=OSHA Basics — 8-Point Inspection')).toBeVisible();
    
    // Assert we have 8 list items (the 8 inspection points)
    const listItems = page.locator('li');
    await expect(listItems).toHaveCount(9); // 8 points + 1 intro bullet = 9 total
    
    // Assert references line is present
    await expect(page.locator('text=References: 29 CFR 1910.178')).toBeVisible();
    
    // Assert specific inspection points are present
    await expect(page.locator('text=Forks: No cracks or bends')).toBeVisible();
    await expect(page.locator('text=Chains & hoses: No kinks')).toBeVisible();
    await expect(page.locator('text=Tires & wheels: Adequate tread')).toBeVisible();
    await expect(page.locator('text=Horn & lights: Horn works')).toBeVisible();
    await expect(page.locator('text=Seat belt & data plate')).toBeVisible();
    await expect(page.locator('text=Leaks/undercarriage')).toBeVisible();
    await expect(page.locator('text=Battery/LP system')).toBeVisible();
    await expect(page.locator('text=Safety devices: Parking brake')).toBeVisible();
  });

  test('All modules have comprehensive OSHA Basics content', async ({ page }) => {
    const modules = [
      { 
        path: '/training/forklift-operator/module-1/pre-operation', 
        title: 'OSHA 1910.178 — Pre-Operation Requirements',
        expectedBullets: 9,
        keyContent: 'PPE & seat belt'
      },
      { 
        path: '/training/forklift-operator/module-2', 
        title: 'OSHA Basics — 8-Point Inspection',
        expectedBullets: 9, // 8 points + intro
        keyContent: 'Forks: No cracks or bends'
      },
      { 
        path: '/training/forklift-operator/module-3', 
        title: 'OSHA Basics — Balance & Load Handling',
        expectedBullets: 7,
        keyContent: 'Stability triangle'
      },
      { 
        path: '/training/forklift-operator/module-4', 
        title: 'OSHA Basics — Workplace Hazards',
        expectedBullets: 9,
        keyContent: 'Blind corners & aisles'
      },
      { 
        path: '/training/forklift-operator/module-5', 
        title: 'OSHA Basics — Charging/Fueling & Care',
        expectedBullets: 9,
        keyContent: 'Battery charging'
      }
    ];

    for (const module of modules) {
      await page.goto(module.path);
      
      // Click OSHA Basics tab if it exists
      const oshaTab = page.locator('[data-testid="tab-osha"]');
      if (await oshaTab.isVisible()) {
        await oshaTab.click();
      }
      
      // Assert the module has OSHA content
      await expect(page.locator(`text=${module.title}`)).toBeVisible();
      
      // Assert there are the expected number of bullet points
      const listItems = page.locator('li');
      await expect(listItems).toHaveCount(module.expectedBullets);
      
      // Assert key content is present
      await expect(page.locator(`text=${module.keyContent}`)).toBeVisible();
      
      // Assert regulatory references are present
      await expect(page.locator('text=29 CFR 1910.178')).toBeVisible();
    }
  });
});
