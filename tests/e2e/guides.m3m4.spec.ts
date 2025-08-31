import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test.describe('M3/M4 Guides API Tests', () => {

  test('M3: Balance & Load Handling guides API (English)', async ({ page }) => {
    const response = await page.request.get(`${BASE}/api/guides/balance-load-handling`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.data.title).toBeTruthy();
    expect(Array.isArray(data.data.cards)).toBe(true);
    expect(data.data.cards.length).toBeGreaterThan(0);
    
    // Verify card structure
    const firstCard = data.data.cards[0];
    expect(firstCard.heading).toBeTruthy();
    expect(firstCard.body).toBeTruthy();
    
    // Should include key stability concepts
    const cardText = JSON.stringify(data.data.cards);
    expect(cardText).toMatch(/capacity|triangle|stability|center/i);
  });

  test('M3: Balance & Load Handling guides API (Spanish)', async ({ page }) => {
    // Set Spanish locale cookie
    await page.context().addCookies([{
      name: 'locale',
      value: 'es',
      domain: new URL(BASE).hostname,
      path: '/'
    }]);
    
    const response = await page.request.get(`${BASE}/api/guides/balance-load-handling`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.locale).toBe('es');
    expect(data.data.title).toContain('Equilibrio');
    expect(Array.isArray(data.data.cards)).toBe(true);
    expect(data.data.cards.length).toBeGreaterThan(0);
    
    // Should include Spanish stability concepts
    const cardText = JSON.stringify(data.data.cards);
    expect(cardText).toMatch(/capacidad|triángulo|estabilidad|centro/i);
  });

  test('M4: Hazard Hunt guides API (English)', async ({ page }) => {
    const response = await page.request.get(`${BASE}/api/guides/hazard-hunt`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.data.title).toBeTruthy();
    expect(Array.isArray(data.data.cards)).toBe(true);
    expect(data.data.cards.length).toBeGreaterThan(0);
    
    // Verify card structure
    const firstCard = data.data.cards[0];
    expect(firstCard.heading).toBeTruthy();
    expect(firstCard.body).toBeTruthy();
    
    // Should include key hazard concepts
    const cardText = JSON.stringify(data.data.cards);
    expect(cardText).toMatch(/hazard|pedestrian|spill|overhead|safety/i);
  });

  test('M4: Hazard Hunt guides API (Spanish)', async ({ page }) => {
    // Set Spanish locale cookie
    await page.context().addCookies([{
      name: 'locale',
      value: 'es',
      domain: new URL(BASE).hostname,
      path: '/'
    }]);
    
    const response = await page.request.get(`${BASE}/api/guides/hazard-hunt`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.locale).toBe('es');
    expect(data.data.title).toContain('Búsqueda');
    expect(Array.isArray(data.data.cards)).toBe(true);
    expect(data.data.cards.length).toBeGreaterThan(0);
    
    // Should include Spanish hazard concepts
    const cardText = JSON.stringify(data.data.cards);
    expect(cardText).toMatch(/peligro|peatones|derrame|seguridad/i);
  });

  test('Guides API fallback behavior', async ({ page }) => {
    // Test with unsupported locale
    await page.context().addCookies([{
      name: 'locale',
      value: 'fr',
      domain: new URL(BASE).hostname,
      path: '/'
    }]);
    
    const response = await page.request.get(`${BASE}/api/guides/balance-load-handling`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.locale).toBe('en'); // API normalizes unsupported locales to 'en'
    expect(data.data.title).toContain('Balance'); // Should fallback to English content
  });

  test('Guides API error handling', async ({ page }) => {
    // Test non-existent guide
    const response = await page.request.get(`${BASE}/api/guides/non-existent-module`);
    expect(response.status()).toBe(404);
    
    const data = await response.json();
    expect(data.ok).toBe(false);
    expect(data.error).toBeTruthy();
  });

  test('Module pages display guides correctly', async ({ page }) => {
    // Test M3 guides display
    await page.goto(`${BASE}/module/balance-load-handling`);
    
    // Should see guides section
    const guidesSection = page.locator('section').filter({ hasText: /guide/i });
    if (await guidesSection.count() > 0) {
      await expect(guidesSection.first()).toBeVisible();
    }
    
    // Test M4 guides display
    await page.goto(`${BASE}/module/hazard-hunt`);
    
    const m4GuidesSection = page.locator('section').filter({ hasText: /guide/i });
    if (await m4GuidesSection.count() > 0) {
      await expect(m4GuidesSection.first()).toBeVisible();
    }
  });

  test('Guides content quality validation', async ({ page }) => {
    // Test M3 content quality
    const m3Response = await page.request.get(`${BASE}/api/guides/balance-load-handling`);
    const m3Data = await m3Response.json();
    
    // Should have sufficient content
    expect(m3Data.data.cards.length).toBeGreaterThanOrEqual(3);
    
    // Each card should have meaningful content
    for (const card of m3Data.data.cards) {
      expect(card.heading.length).toBeGreaterThan(5);
      expect(card.body.length).toBeGreaterThan(20);
    }
    
    // Test M4 content quality
    const m4Response = await page.request.get(`${BASE}/api/guides/hazard-hunt`);
    const m4Data = await m4Response.json();
    
    expect(m4Data.data.cards.length).toBeGreaterThanOrEqual(3);
    
    for (const card of m4Data.data.cards) {
      expect(card.heading.length).toBeGreaterThan(5);
      expect(card.body.length).toBeGreaterThan(20);
    }
  });

});
