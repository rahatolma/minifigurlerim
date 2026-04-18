# Technical Debt & Release Backlog

**Status:** Active  
**Owner:** DevOps / Operations  
**Last Updated:** 17 Nisan 2026  

**TL;DR:** Derleme esnasında çıkan Warning mesajları veya mimari ertelemeler (tech-debt) burada standart bir formatla depolanıp sprint atandıklarında eritilir. Not defteri değildir.

---

## 1. Amaç
Sistemde er ya da geç patlayacak, yavaşlatacak veya "upgrade" bariyerine dönüşecek tasarımsal eksiklikleri (technical debt) veya derleyici uyarılarnı somutlaştırıp izlenebilir "Issue" formatına sokmak.

## 2. Aktif Backlog (TABLO)

| ID | Başlık | Tür | Risk Seviyesi | Öncelik | Katman | Çözüm Yaklaşımı | Owner | Status |
|----|--------|-----|---------------|---------|--------|-----------------|-------|--------|
| TD-001 | Sentry Deprecation Warnings | Deprecation | Low | P2 | Build | `@sentry/nextjs` paketi sürüm yükseldiğinde konfigürasyon (`disableLogger`, `reactComponentAnnotation`) revize edilecek. | DevOps | Open |
| MIG-001 | Next.js Middleware -> Proxy Geçişi | Refactor | Medium | P2 | App/Edge | Next.js 16/17 roadmap'ine uymak için `middleware.ts` yönlendirme kuralları `proxy.ts` mimarisine dönüştürülecek. | Architect | Scheduled |
| MIG-002 | Supabase Cascading RLS Limits | Risk/Refactor | High | P1 | Database / RPC | İki sequential Supabase "update" atışı yerine, Data Integrity sağlama adına işlem DB katmanında (RPC) transactional yapılacak. | Backend | Open |
| TD-002 | Series 30-Day Trend Ranking | Refactor | High | P1 | Database / RPC | Series popular filter is historically static via total_views. Needs rolling window aggregation table (`series_daily_views`) & cron refresh logic. | Backend | Open |

## 3. Durum (Status) Standartları
- **Open:** Gelecekte yapılmak üzere listelenmiştir. İşgücü atanmamıştır.
- **Scheduled:** Hedef bir versiyona veya release'e eklenmesi onaylanmıştır.
- **In Progress:** Üzerinde geliştirme dalında (branch) çalışılmaktadır.
- **Resolved:** Tamamlanmış ve silinmek üzere (sonraki temizlikte) arşivlenmiş.

## 4. Kurallar
- Yeni build warning çıktığında, derhal bu backlog'a `Deprecation` türüyle eklenmek zorundadır.
- Bu backlog dışında "Console" veya "Terminal" warning'i bırakılamaz. Terminal derlemesi sarı leke barındırmamalıdır.

## 5. Update Trigger
Bu doküman ne değişirse güncellenmek (ve PR içinde gönderilmek) zorunda?
- Yeni bir Build Warning yakalandığında.
- Bağımlı paketlerden biri (Örn: Supabase, Tailwind, Sentry) majör sürüme yükseltildiğinde.
- Bir backlog issue'su çözülüp `Resolved` statüsüne çekildiğinde.
