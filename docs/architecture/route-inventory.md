# Route Architecture Inventory

**Status:** Active  
**Owner:** Core Architecture Team  
**Last Updated:** 17 Nisan 2026  

**TL;DR:** Next.js derleme mimarisi rastgele dinamik sayfalara izin vermez. Force-dynamic veya edge runtime kullanımına sebep olan tüm rotalar, nedenleriyle birlikte bu belgede tablo halinde açıklanmıştır. Mimari bir itiraz olmadığı sürece bu tablo standartlara uymakla yükümlüdür.

---

## 1. Amaç
Tüm Next.js rotalarının (`/src/app`) rendering stratejisini, cache mekaniğini ve çalışma ortamını (runtime) tek bir bakışta, yorumlardan arınmış, şeffaf bir tabloda görebilmek.

## 2. Route Envanteri (Zorunlu Harita)

| Route (URL) | Type | Rendering | Runtime | Auth | Cache / Revalidate | Data Source | Neden Bu Mod Seçildi? |
|-------------|------|-----------|---------|------|--------------------|-------------|-----------------------|
| `/` (Home)  | Page | Dynamic | `nodejs` | Optional | `none` | Session + Public Data | Kullanıcı session'ı kontrol edilir ve Gamification CTA gösterilir. Otomatik hydrate edilir. |
| `/seriler` | Page | ISR | `nodejs` | No | `300s` (veya On-Demand) | Supabase Public | SEO ve yükleme hızını maksimize eder, global okuma olduğu için statik cache'de bekler. |
| `/seriler/[slug]` | Page | ISR | `nodejs` | No | `300s` | Supabase Public | Ziyaretçilerin doğrudan gördüğü statik ürün detayları. Progress var ise client boundary'de basılır. |
| `/koleksiyonum` | Page | Dynamic | `nodejs` | Required | `none` | Supabase RLS (User Data) | Özel portföy ve güvenlik sınırı. Statik derlenmesi veriyi sızdırır. `force-dynamic` zorunludur. |
| `/login` | Page | Dynamic | `nodejs` | No | `none` | OAuth / Auth Session | Session ve middleware auth redirection kontrolü sağlar. |
| `/api/og/figure` | API | Dynamic | `edge` | No | `none` | URL Param → Vercel `@vercel/og` | Vercel'in resim çizim kütüphanesi svelte/edge altyapısı ister. Zorunlu ve bilinçli bir karardır. |

## 3. Kurallar
- **Rastgele Dynamic Sayfa Yasaktır:** `cookies()`, `headers()` veya Search Params (`useSearchParams()`) kullanımı rotayı otomatik `dynamic` yapar. Bu kullanım public ve SEO beklenen bir sayfada ise kod review (PR) aşamasında reddedilir.
- **Standart SSR Yasası:** Auth Boundary içerisindeki özel rotalar haricinde, public view sunan her sayfa Static, ISR (Incremental Static Regeneration) veya Partial Prerendering hedefinde olmak zorundadır.

## 4. Update Trigger
Bu doküman ne değişirse güncellenmek (ve PR içinde gönderilmek) zorunda?
- Sisteme yeni bir root route klasörü (Örn: `/admin`, `/kesfet`) eklendiğinde.
- Mevcut bir route'un rendering metodu (Örn: `export const revalidate = 0` veya `force-dynamic`) değiştirildiğinde.
