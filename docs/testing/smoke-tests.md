# Minifigürlerim Production Smoke Tests

**Status:** Active  
**Owner:** QA / Release Management  
**Last Updated:** 17 Nisan 2026  

**TL;DR:** Kodu sunucuya göndermeden önce veya sistemde bir servis çöküşü atlatıldıktan sonra test edilmesi "Zorunlu" olan kritik yol (critical path) kullanıcı akışları. İlerleyen süreçte bu klasör Playwright E2E'nin veri kaynağı olacaktır.

---

## 1. Amaç
Uygulamanın mimari köklerini test etmek. Bir "Component" içindeki küçük bir UI hatasından çok, uygulamanın temel oturum izolasyonunu (Auth Boundary), global durum yönetimini (hydration) ve sayfa rendering'i çökertip çökertmediğini hızlı bir e2e QA listesiyle doğrulamak.

## 2. Test Yürütme ve Observability (Görünürlük)
Sistemde manuel test defterleri yerine otonom Playwright altyapısı koşmaktadır (`e2e/smoke.spec.ts`).

- **Hangi Testler Otomatik?**
  Aşağıdaki listede "Otomasyon: Playwright" yazan tüm senaryolar CI'da koşar.
- **Nasıl Çalıştırılır (Local)?**
  Terminalde `npm run test:e2e` komutuyla 4 saniyede çalışır. Ayrıntılı UI logu için `npx playwright show-report` kullanılır.
- **CI'da Nerede Koşar?**
  GitHub Actions (`.github/workflows/playwright.yml`) tarafından her `push` ve `pull_request` evresinde Ubuntu makinesinde otomatik koşar.
- **Fail Olursa Ekip Neye Bakar?**
  1. Terminaldeki/GitHub'daki "Error Logs" sekmesine. Ciddi bir Next.js 500 sayfası fırlamış olabilir.
  2. Eğer Hydration hatası (Sarı/Kırmızı React logları) atıldıysa tarayıcıda SSR DOM eşleşmesi patlamıştır, component kodlarına bakılır.

## 3. Zorunlu QA Senaryoları (Test Suite)

### Test A: Guest Homepage Load (İzolasyon Doğrulaması)
*   **Ön Koşul:** Kullanıcı sistemden çıkış yapmış olmalı (veya Gizli Sekme açık olmalı).
*   **Adımlar:**
    1. Tarayıcıda ana sayfa `/` adresine gidilir.
*   **Beklenen Sonuç:**
    *   HTTP 200 OK yanıtı alınır.
    *   Ekranda "Oturum Aç" / "Erişim" isteyen uyarılar (AuthCTA) görünür.
*   **Failure (Başarı Dağılımı):**
    *   Eğer Next.js 500 sayfası veya boş (beyaz) ekran gelirse test PATLAR. (Provider mimarisi zedelenmiş demektir).
*   **Critical:** Yes
*   **Automation:** Playwright eklendi.

### Test B: Locale Switch Stability (Dil Hydration)
*   **Ön Koşul:** Sayfa tamamen yüklenmiş olmalıdır.
*   **Adımlar:**
    1. Header'daki dil seçimi üzerinden `TR` -> `EN` e veya tam tersine tıklanır.
*   **Beklenen Sonuç:**
    *   Sayfa yenien yüklenmeden veya React Hydration Error pop-up'ı ('Text content did not match') olmadan URL değişir (örn: `/en/`).
    *   Meta `lang` verisi güncellenir.
*   **Failure (Başarı Dağılımı):**
    *   Tarayıcı console'unda kırmızı hydration error oluşmuşsa PATLAR.
*   **Critical:** Yes
*   **Automation:** Playwright eklendi.

### Test C: Login ve Auth Boundary Geçişi
*   **Ön Koşul:** Çıkış yapılmış durum.
*   **Adımlar:**
    1. `/login` sayfasına girilip başarılı oturum açılır.
    2. Manuel olarak URL üzerinden `/koleksiyonum` rotasına gidilir.
*   **Beklenen Sonuç:**
    *   Oturum açıldıktan sonra kullanıcı doğru yere Redirect edilir.
    *   Koleksiyon sayfasında o kullanıcıya ait özel veri tabanı nesnesi görülür.
*   **Failure (Başarı Dağılımı):**
    *   Eğer `/koleksiyonum` listesinde başka (veya null) veri görünürse (Zombie State) PATLAR.
*   **Critical:** Yes
*   **Automation:** Playwright eklendi.

### Test D: Logout State Sıfırlanması
*   **Ön Koşul:** Oturum açılmış ve `/koleksiyonum` vs görüntülenmiş olmalıdır.
*   **Adımlar:**
    1. Navigasyondan "Çıkış Yap" (Logout) mekanizması tetiklenir.
*   **Beklenen Sonuç:**
    *   Arayüz anında (veya hard-redirect ile) Guest (Ziyaretçi) görünümüne (CTA maskesine) döner.
    *   Local storage / Cookies temizlenmiş olmalıdır.
*   **Failure (Başarı Dağılımı):**
    *   Çıkış yapıldıktan sonra `/koleksiyonum` listesi hâlâ önbellekte görünüyorsa PATLAR.
*   **Critical:** Yes
*   **Automation:** Kısmen.

### Test E: Error Fallback Capture (404 Testi)
*   **Ön Koşul:** Sitede olmak yeterlidir.
*   **Adımlar:**
    1. Rastgele, mantıksız bir URL yazılır (Örn: `/olmayan-bir-rota`).
*   **Beklenen Sonuç:**
    *   Sistem varsayılan / zarif bir Custom 404 (Not Found) sayfası gösterir.
*   **Failure (Başarı Dağılımı):**
    *   404 yerine `Internal Server Error` atıyorsa sistemin Boundary kalkanı deliktir.
*   **Critical:** Yes
*   **Automation:** Playwright eklendi.

## 3. Update Trigger
Bu doküman ne değişirse güncellenmek (ve PR içinde gönderilmek) zorunda?
- Yeni bir feature eklendiğinde (Örn: Sepet/Market).
- Temel Auth (Giriş/Çıkış) mekanizması altyapısı değiştirildiğinde.
