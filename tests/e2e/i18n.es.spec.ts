import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function signIn(page: any) {
  // Navigate to login page or check if already signed in
  await page.goto(`${BASE}/login`);
  
  // Wait for either the login form or a redirect if already logged in
  await page.waitForTimeout(2000);
  
  // Check if we're already logged in by looking for dashboard/training elements
  const isLoggedIn = await page.getByText(/training|dashboard|module/i).isVisible().catch(() => false);
  
  if (!isLoggedIn) {
    // If login form is present, wait for manual login
    console.log('Please sign in manually when prompted...');
    
    // Wait for successful login (look for redirect or training-related content)
    await page.waitForFunction(() => {
      return window.location.pathname !== '/login' || 
             document.body.innerText.toLowerCase().includes('training') ||
             document.body.innerText.toLowerCase().includes('dashboard');
    }, { timeout: 60000 });
    
    console.log('Login detected, continuing with test...');
  }
}

test('ES chrome on hub/module/records', async ({ page }) => {
  // Set Spanish locale cookie
  await page.context().addCookies([{ 
    name: 'locale', 
    value: 'es', 
    url: BASE, 
    path: '/' 
  }]);

  // Test Training Hub Spanish UI
  await page.goto(`${BASE}/training?courseId=test`);
  
  // Wait for page to load
  await page.waitForSelector('h1', { timeout: 10000 });
  
  // Check Training Hub title in Spanish
  await expect(page.getByRole('heading', { name: /Centro de Formación/i })).toBeVisible();
  
  // Check Orientation link in Spanish
  await expect(page.getByRole('link', { name: /Orientación/i })).toBeVisible();
  
  // Check Final Exam section in Spanish
  await expect(page.getByText(/Examen final/i)).toBeVisible();
  
  // Check Supervisor Evaluation section in Spanish
  await expect(page.getByText(/Evaluación práctica del supervisor/i)).toBeVisible();

  // Test Module page Spanish UI
  await page.goto(`${BASE}/module/1`);
  
  // Wait for module page to load
  await page.waitForSelector('h1', { timeout: 10000 });
  
  // Check for Spanish module intro text
  await expect(page.getByText(/Haz la demo\. Lee las guías\. Responde el mini-quiz\./i)).toBeVisible();
  
  // Check for Spanish quiz section
  await expect(page.getByText(/Verifica tu conocimiento/i)).toBeVisible();
  
  // Check for Spanish quiz description
  await expect(page.getByText(/preguntas rápidas.*Aprobar.*80%/i)).toBeVisible();

  // Test Records page Spanish UI (requires authentication)
  await signIn(page);
  
  await page.goto(`${BASE}/records`);
  
  // Wait for records page to load
  await page.waitForSelector('h1', { timeout: 10000 });
  
  // Check Records title in Spanish
  await expect(page.getByRole('heading', { name: /Registros/i })).toBeVisible();
  
  // Check Supervisor Evaluation section in Spanish
  await expect(page.getByText(/Evaluación del supervisor/i)).toBeVisible();
});

test('Language switcher functionality', async ({ page }) => {
  // Start with English (default)
  await page.goto(`${BASE}/training?courseId=test`);
  
  // Wait for page to load
  await page.waitForSelector('h1', { timeout: 10000 });
  
  // Should see English by default
  await expect(page.getByRole('heading', { name: /Training Hub/i })).toBeVisible();
  
  // Find and use language switcher
  const languageSelect = page.getByLabel(/Language/i);
  await expect(languageSelect).toBeVisible();
  
  // Switch to Spanish
  await languageSelect.selectOption('es');
  
  // Wait for locale change event to process
  await page.waitForTimeout(1000);
  
  // Refresh page to see server-side changes
  await page.reload();
  
  // Should now see Spanish
  await expect(page.getByRole('heading', { name: /Centro de Formación/i })).toBeVisible();
  
  // Switch back to English
  await languageSelect.selectOption('en');
  await page.waitForTimeout(1000);
  await page.reload();
  
  // Should see English again
  await expect(page.getByRole('heading', { name: /Training Hub/i })).toBeVisible();
});
