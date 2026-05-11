# Minifigürlerim Master Roadmap & Operation Panel

Bu doküman, projenin üretim, istikrar ve launch (canlıya çıkış) süreçlerini merkezi olarak takip etmek için oluşturulan **Yaşayan Kaynak'tır (Single Source of Truth).**

---

## 1. CURRENT STATUS

- **Current Phase:** Pre-Launch Stabilization & Architectural Debt Resolution
- **Current Priority:** High-Risk Cache / Dynamic De-opt Prevention (DAL Split)
- **Current Active Branch:** `refactor/dal-public-private-split` *(Beklemede/Planlanıyor)*
- **Current Launch Readiness:** %90
- **Current Blockers:** DAL mimarisindeki `cookies()` okuma kirliliği ve Middleware Auth Redirect eksiklikleri.

---

## 2. COMPLETED OPERATIONS

*Son dönemde başarıyla production/preview ortamına taşınan operasyonlar:*

- [x] **OAuth Preview Redirect Fix**
  - Tarih: `2026-05-11` | Branch: `fix/oauth-preview-redirect`
  - Durum: Merged | Ortam: Production
- [x] **Rating Modal Recursion Fix**
  - Tarih: `2026-05-11` | Branch: `fix/rating-modal-interactions`
  - Durum: Merged | Ortam: Production
- [x] **Blog Content Renderer Fix**
  - Tarih: `2026-05-11` | Branch: `fix/blog-content-renderer`
  - Durum: Merged | Ortam: Production
- [x] **Manual Smoke Test Checklist Creation**
  - Tarih: `2026-05-11` | Branch: `docs/manual-smoke-test-checklist`
  - Durum: Merged | Ortam: Documentation
- [x] **Serverless Soft Rate Cache Removal**
  - Tarih: `2026-05-11` | Branch: `fix/remove-serverless-soft-rate-cache`
  - Durum: Merged | Ortam: Production
- [x] **Public Read Client Boundaries Fix**
  - Tarih: `2026-05-11` | Branch: `fix/public-read-client-boundaries`
  - Durum: Merged | Ortam: Production
- [x] **Remove Redundant Rating CTA**
  - Tarih: `2026-05-11` | Branch: `fix/remove-redundant-rating-cta`
  - Durum: Merged | Ortam: Production

---

## 3. ACTIVE OPERATIONS

*Şu an üzerinde çalışılan veya sıraya alınan operasyonlar:*

1. **DAL Public/Private Split (`refactor/dal-public-private-split`)**
   - **Risk Seviyesi:** CRITICAL (Cache De-opt riski)
   - **Launch Blocker mı?:** Evet
   - **Owner:** AI Agent & Eng. Lead
   - **Status:** Planlanıyor

2. **Middleware Hard Redirect Guard (`fix/middleware-auth-redirect`)**
   - **Risk Seviyesi:** MEDIUM (Protected sayfa sızıntısı riski)
   - **Launch Blocker mı?:** Kısmen
   - **Owner:** AI Agent & Eng. Lead
   - **Status:** Backlog'da bekliyor

---

## 4. LAUNCH BLOCKERS

*Sadece projeyi canlıya almayı **durduran** acil maddeler:*

- [ ] **DAL Split Migration:** `getAuthUserProfile()` gibi `cookies()` okuyan servislerin, public sayfaları gizlice `force-dynamic`'e düşürmemesi için `dal_public.ts` ve `dal_private.ts` olarak ayrıştırılması.

---

## 5. POST-LAUNCH BACKLOG

*Proje canlıya çıktıktan sonra, sistemi daha dayanıklı ve güvenli hale getirmek için ele alınacak Technical Debt maddeleri:*

- [ ] **Zod Runtime Validation:** Tüm Form Action ve CMS/Blog Bloklarının runtime şema doğrulaması.
- [ ] **Blog Block Versioning Strategy:** CMS blokları güncellendiğinde geriye dönük uyumluluk yapısı.
- [ ] **Server-Side Sanitize Layer:** Metin girdilerini XSS'e karşı daha güçlü filtreleyen orta katman.
- [ ] **Renderer Test Fixtures:** Yeni UI bileşenlerinin ve Blog render sisteminin statik JSON test kurguları.
- [ ] **Advanced Observability:** `trackUserViewDal` ve benzeri yerlerde `Sentry captureException` kullanılması.
- [ ] **Locale-Aware Block Rendering:** Blog bloklarına dil spesifik kurallar/render yapıları eklenmesi.

---

## 6. SMOKE TEST LINKS

- **[Manual Smoke Test Checklist](./../testing/manual-smoke-test-checklist.md)**
- **[Production Stabilization Audit](./../audits/production-stabilization-audit-2026-05-11.md)**

---

## 7. RELEASE DISCIPLINE (Kurallarımız)

Ekibin ve AI ajanlarının kesin olarak uyması gereken iş akışı standartları:

1. **No Direct Main Edits:** Kesinlikle main branch üzerinde doğrudan değişiklik yapılamaz. Her iş kendi izole branch'inde başlar.
2. **Preview Before Merge:** Yapılan her değişiklik Vercel Preview ortamında veya Local'de canlı testten (Smoke Test) geçmeden merge edilmez.
3. **Scope Isolation:** İlgili branch'te "hazır elim değmişken" mantığıyla konu dışı (scope creep) refactor YAPILAMAZ.
4. **Proof-First Reporting:** Görev tamamlandığında `git diff --stat` ve `npm run build` kanıtları sunulmadan onay istenemez.
5. **Smoke Validation Before Production:** Çok büyük değişikliklerden sonra Manuel Smoke Test Dokümanı (Madde 6) tam olarak uygulanmalıdır.
