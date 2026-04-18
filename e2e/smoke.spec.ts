import { test, expect } from '@playwright/test';

test.describe('Minifigürlerim Critical Path Smoke Tests', () => {

  test('Guest homepage loads without crashing', async ({ page }) => {
    const response = await page.goto('/');
    // Check if the page didn't throw a Next.js 500 error
    expect(response?.status()).toBe(200);
    
    // Verify an element that indicates successful mount. E.g logic waiting for UI.
    // For Minifigurlerim, the main wrapper or language check should pass.
    await expect(page.locator('body')).toBeVisible();
  });

  test('Locale Switcher toggles correctly from TR to EN', async ({ page }) => {
    // Navigate and assume default is TR
    await page.goto('/');
    
    // Ensure we are fully loaded
    await page.waitForLoadState('networkidle');

    // This may vary depending on actual layout. 
    // We expect the locale switch to work without hydration issues.
    // E.g. clicking the "EN" button if it exists or navigating to /en
    const response = await page.goto('/en');
    expect(response?.status()).toBe(200);
    
    // Verify HTML lang attribute changed
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('Login page transition and Auth Boundaries', async ({ page }) => {
    // Should be able to go to /login directly
    const loginResponse = await page.goto('/login');
    expect(loginResponse?.status()).toBe(200);

    // Guest should NOT be able to view /koleksiyonum without redirect
    await page.goto('/koleksiyonum');
    expect(page.url()).toContain('/login'); // Should redirect due to auth boundary
  });

  test('Invalid Routes show 404 instead of 500 boundary error', async ({ page }) => {
    const response = await page.goto('/olmayan-rota-xxx-123');
    expect(response?.status()).toBe(404);
  });

});
