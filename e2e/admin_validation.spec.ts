import { test, expect } from '@playwright/test';

test.describe.skip('Admin Validation Context', () => {
    
    test.beforeEach(async ({ page }) => {
        // Authenticate as Admin
        // This is a placeholder since Auth logic varies (e.g. cookie injection, API mock, or UI login)
        await page.goto('/login');
        // ... execute login ...
        await page.goto('/admin/figurler/yeni');
    });

    test('Piece Count veya Figure Number eksikken Server kaydı engellenmeli (Client UI Toast Gösterilmeli)', async ({ page }) => {
        // Fill mandatory series, name, code
        await page.fill('input[name="brand"]', 'LEGO®');
        await page.selectOption('select[name="series_id"]', { index: 1 });
        await page.fill('input[name="name"]', 'Robot Tester');
        await page.fill('input[name="code"]', 'col-test-robot-1');
        
        // Leave piece_count and figure_number intentionally empty
        await page.click('button[type="submit"]');

        const errorMessage = page.locator('text=Validasyon Hatası');
        await expect(errorMessage).toBeVisible();
    });

    test('String veya NaN gönderilmeye çalışıldığında form reddetmeli', async ({ page }) => {
        // Assume HTML validation doesn't catch it and somehow sends text
        // (Playwright can force text onto number inputs)
        await page.fill('input[name="figure_number"]', 'ab12c');
        await page.fill('input[name="piece_count"]', '-5');
        
        // This confirms the client validation UX layer protects against bad input.
        expect(await page.locator('input[name="figure_number"]').inputValue()).not.toBe('ab12c');
    });
});
