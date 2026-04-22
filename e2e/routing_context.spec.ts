import { test, expect } from '@playwright/test';

test.describe.skip('Routing Context (Public Domain)', () => {
  test('Aynı isimli figürler (Alien vs Alien) kendi serilerinde doğru route üzerinde açılmalı', async ({ page }) => {
    // 1. Visit Series 6 Alien
    await page.goto('/figurler/lego-minifigurler-serisi-6/uzayli'); // Example Slug
    await expect(page).toHaveTitle(/Uzaylı/);
    
    // 2. Visit Series 21 Alien
    await page.goto('/figurler/lego-minifigurler-serisi-21/uzayli');
    await expect(page).toHaveTitle(/Uzaylı/);
    
    // Verify distinctness based on UI elements (like Series Name presented on page)
    const seriesBadge = page.locator('text=Serisi 21');
    await expect(seriesBadge).toBeVisible();
  });

  test('Yanlış seriesSlug + doğru figureSlug kombinasyonu 404 sayfasına düşmeli', async ({ page }) => {
    // Attempting to access an existing figure (uzayli) in a non-existent/wrong series (serisi-199)
    const response = await page.goto('/figurler/lego-minifigurler-serisi-199/uzayli');
    
    expect(response?.status() === 404 || await page.locator('text=Aradığınız sayfa bulunamadı').isVisible()).toBeTruthy();
  });
});
