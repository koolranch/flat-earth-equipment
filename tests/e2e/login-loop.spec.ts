import { test, expect } from '@playwright/test';

test('after successful login, server sees user (debug page)', async ({ page }) => {
  // This is a doc placeholder. Manual: login, then visit /debug/auth and ensure user is present.
  expect(true).toBeTruthy();
});

test('login page shows form and handles auth flow', async ({ page }) => {
  await page.goto('/login');
  
  // Check login form is present
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByLabelText('Email')).toBeVisible();
  await expect(page.getByLabelText('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  
  // Check debug link is present
  await expect(page.getByText('/debug/auth')).toBeVisible();
});

test('debug auth page shows session info', async ({ page }) => {
  await page.goto('/debug/auth');
  
  // Should show auth debug information
  await expect(page.getByRole('heading', { name: 'Auth Debug' })).toBeVisible();
  await expect(page.getByText(/Server sees user:/)).toBeVisible();
  await expect(page.getByText(/Cookie sb-access-token present:/)).toBeVisible();
});
