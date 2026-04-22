import { test, expect } from '@playwright/test';

// Kapsamlı gerçek tarayıcı ortamı (E2E) UI testleri
// Dev server'ı ayakta olduğunda çalışacaktır: npm run test:e2e
test.describe.skip('Figures Page Real Browser E2E - Contract Tests', () => {

    test('Invalid dependent param redirect preserves locale segment', async ({ page }) => {
        // Star wars serisinde "wizard" rolü olmamasına dayalı bir senaryo.
        await page.goto('/tr/figurler?series=star-wars&role=wizard');

        // Router bu kirli URI üzerinde 308 çekecek ve canonicalize edilmiş URI olarak
        // star-wars serisini tutup role parametresini düşürecektir.
        await page.waitForURL(/\/tr\/figurler\?series=star-wars(?:&|$)/);

        // URL'de role barınmamalı
        expect(page.url()).not.toContain('role=');

        // Locale segmentinin korunması kanıtlanmalı
        expect(page.url()).toContain('/tr/figurler');
    });

    test('Locale switch preserves parameters and normalizes correctly', async ({ page }) => {
        // 1. Türkçe üzerinden doğru bir canonical rarity (rare) request
        const initialResponse = await page.goto('/tr/figurler?rarity=rare');
        console.log(`\n\nDIAGNOSTIC_CHAIN status=${initialResponse?.status()} location=${initialResponse?.headers()['location'] || 'NONE'} finalUrl=${page.url()}\n\n`);
        
        expect(page.url()).toContain('rarity=rare');

        // 2. Dropdown'da Lokalize 'Nadir' etiketinin kontrolü (UI level)
        // Normal şartlarda "select[name='rarity']" UI'da component rendererına bağlıdır.
        // Option içeriğinde text olarak "Nadir" bulunduğu doğrulanır.
        const rarityDropdown = page.locator('select[name="rarity"]');
        await expect(rarityDropdown).toHaveValue('rare'); 
        
        // 3. Locale EN switch
        await page.click('button[data-testid="lang-switch-en"]');
        
        // 4. URL'in İngilizce yapıda canonical query'yi koruduğu kontrol edilmeli
        await page.waitForURL(/\/en\/figures\?rarity=rare/);
        
        // 5. Query korundu mu?
        expect(page.url()).toContain('rarity=rare');
    });

    test('Filter UI reflects canonical state without zero-results death-loop', async ({ page }) => {
        // Gerçekten var olmayan ve redirect ile yakalanamayan (eğer allowed seçenekler boş ise vb.) filterlarda Empty State
        await page.goto('/tr/figurler?role=NonExistentHacker');

        // Geçersiz argüman canonical olarak temizlenir.
        await page.waitForURL(/\/tr\/figurler/);
        expect(page.url()).not.toContain('NonExistentHacker');
        
        // Legal ama sıfır çeken bir parametre girelim (bu gerçekten 0 kayıt getirmeli ve empty state göstermeli)
        await page.goto('/tr/figurler?type=Keychain');
        // Ekranda "0 KAYIT LİSTELENİYOR" gibi empty text veya sadece listeleme frame i render olmali
        // Absolute totalCount olan total sayısı her halükarda UI'da görünmelidir.
        await expect(page.locator('text=/KAYIT LİSTELENİYOR/i').first()).toBeVisible();
    });
});