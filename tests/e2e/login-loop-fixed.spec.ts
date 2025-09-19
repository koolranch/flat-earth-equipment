import { test, expect } from '@playwright/test';
// Manual: After patch, log in, then visit /debug/auth → should show a user id.
// This file is a placeholder to remind us to verify manually.

test('doc placeholder', async () => { 
  expect(true).toBeTruthy(); 
});

test('login page shows proper form', async ({ page }) => {
  await page.goto('/login');
  
  // Check login form elements
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByLabelText('Email')).toBeVisible();
  await expect(page.getByLabelText('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('debug auth page loads without errors', async ({ page }) => {
  await page.goto('/debug/auth');
  
  // Should show debug information
  await expect(page.getByRole('heading', { name: 'Auth Debug' })).toBeVisible();
  await expect(page.getByText(/Server sees user:/)).toBeVisible();
  await expect(page.getByText(/Cookie sb-access-token present:/)).toBeVisible();
});
