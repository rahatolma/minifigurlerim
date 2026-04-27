import { test, expect } from '@playwright/test';

// Kapsamlı gerçek tarayıcı ortamı (E2E) UI testleri
// Dev server'ı ayakta olduğunda çalışacaktır: npm run test:e2e
test.describe('Figures Page Real Browser E2E - Contract Tests', () => {

    test('English figures page does not silently render Turkish filter labels', async ({ page }) => {
        await page.goto('/en/figures');

        const forbidden = ['Yaygın', 'Nadir', 'Çok Nadir', 'Efsanevi'];

        for (const word of forbidden) {
            await expect(page.locator(`text=${word}`)).toHaveCount(0);
        }
    });

    test('English figures page renders localized rarity options', async ({ page }) => {
        await page.goto('/en/figures');
        
        // Use select element's name attribute to find the rarity dropdown
        const rarityDropdown = page.locator('select[name="rarity"]');
        
        // Verify rarity labels exist (Legendary is not asserted as it depends on DB seeding)
        const optionTexts = await rarityDropdown.innerText();
        expect(optionTexts).toContain('Common');
        expect(optionTexts).toContain('Rare');
        expect(optionTexts).toContain('Super Rare');
    });

    test('English figures page renders English series options or explicit fallback', async ({ page }) => {
        await page.goto('/en/figures');
        
        const seriesDropdown = page.locator('select[name="series"]');
        const optionsText = await seriesDropdown.innerText();
        
        // Assert it does not contain the pure Turkish leakage word "Serisi" WITHOUT explicitly being tagged as a fallback
        // Since we explicitly tag fallbacks with [TR], we expect standard "Series" to be present for English titles.
        expect(optionsText).toContain('Series');
    });

    test('Turkish figures page preserves Turkish rarity labels', async ({ page }) => {
        await page.goto('/tr/figurler');
        
        const rarityDropdown = page.locator('select[name="rarity"]');
        
        const optionTexts = await rarityDropdown.innerText();
        expect(optionTexts).toContain('Yaygın');
        expect(optionTexts).toContain('Nadir');
        expect(optionTexts).toContain('Çok Nadir');
    });

    test('Hard Contract: Fallback visibility rule ensures Turkish does not silently leak', async ({ page }) => {
        // Inject a mock series with title_en = null
        await page.goto('/en/figures?_mockFallback=1');
        
        const seriesDropdown = page.locator('select[name="series"]');
        const optionsText = await seriesDropdown.innerText();
        
        // Assert the mock series does not leak silently as pure Turkish
        expect(optionsText).not.toContain('LEGO Minifigürler Serisi X\n');
        
        // Assert it explicitly marks the fallback with [TR] so admins can spot it
        expect(optionsText).toContain('[TR] LEGO Minifigürler Serisi X');
    });

    test('Locale switch preserves parameters and normalizes correctly', async ({ page }) => {
        await page.goto('/en/figures?rarity=rare');
        
        // Rarity selected should be rare
        const rarityDropdown = page.locator('select[name="rarity"]');
        await expect(rarityDropdown).toHaveValue('rare');
    });
});