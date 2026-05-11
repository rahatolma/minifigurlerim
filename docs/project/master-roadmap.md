# Minifigürlerim Master Roadmap & Operation Panel

Bu doküman, projenin üretim, istikrar ve launch (canlıya çıkış) süreçlerini merkezi olarak takip etmek için oluşturulan **Yaşayan Kaynak'tır (Single Source of Truth).**

---

## 1. CURRENT STATUS

- **Current Phase:** Pre-Launch Stabilization & Architectural Debt Resolution
- **Current Priority:** High-Risk Cache / Dynamic De-opt Prevention (DAL Split)
- **Current Active Branch:** `docs/roadmap-sync-after-dal-step1`
- **Current Launch Readiness:** %92
- **Current Blockers:** DAL mimarisindeki `cookies()` okuma kirliliği ve Middleware Auth Redirect eksiklikleri.

**Current Risks:**
- Remaining mixed DAL imports (Katalog dışı sayfalar hala `dal.ts` kullanıyor)
- Private/Public coexistence (Karma import yapıları devam ediyor)
- Stale imports risk (Ölü veya eski importların taşınma riski)

**Current Stable Areas:**
- Catalog Routes (Tamamen statik ve güvenli)
- Blog Renderer (Stabil)
- OAuth Preview Flow (Stabil)
- Rating System (Stabil, Redundant CTA'lar temizlendi)
- Smoke Workflow (Manuel QA Checklist oluşturuldu)

---

## 2. COMPLETED OPERATIONS

*Son dönemde başarıyla production/preview ortamına taşınan operasyonlar:*

- [x] **DAL Public Step 1 Boundary Extraction**
  - Tarih: `2026-05-11` | Branch: `refactor/dal-public-step-1`
  - Durum: Merged | Ortam: Production
- [x] **Public Catalog Routes Static Safety**
  - Tarih: `2026-05-11` | Branch: `refactor/dal-public-step-1`
  - Durum: Merged | Ortam: Production
- [x] **Series Filter Slug Match Fix**
  - Tarih: `2026-05-11` | Branch: `refactor/dal-public-step-1`
  - Durum: Merged | Ortam: Production
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

1. **DAL Step 2 Pending (`refactor/dal-public-step-2`)**
   - **Risk Seviyesi:** MEDIUM (Homepage / Blog migration)
   - **Launch Blocker mı?:** Evet
   - **Owner:** AI Agent & Eng. Lead
   - **Status:** Planlanıyor

2. **Private/Auth Boundary Migration Pending (`refactor/dal-private-split`)**
   - **Risk Seviyesi:** CRITICAL
   - **Launch Blocker mı?:** Evet
   - **Owner:** AI Agent & Eng. Lead
   - **Status:** Backlog'da bekliyor

3. **Middleware Hard Redirect Guard (`fix/middleware-auth-redirect`)**
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
- [ ] **Admin / CTO Panel Audit & Cleanup:** Admin panelde atıl kalan, tekrar eden, gereksiz veya riskli (kullanıcı yönetimi, audit log, haber/seri/figür yönetimi, role guard) ekranların temizlenmesi ve empty/loading state kontrolleri.

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
