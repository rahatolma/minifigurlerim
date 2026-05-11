# DAL Private & Auth Boundary Plan

## 1. Private/Auth Kullanan Route Envanteri
Sistemin kapalı devre (authenticated) veya admin/cto yetkisi gerektiren rotaları:
- `/[locale]/(public)/koleksiyonum` (Kullanıcı özel koleksiyon listesi)
- `/[locale]/(public)/profil` (Kullanıcı profili ve istatistikleri)
- `/[locale]/(auth)/*` (Login, Register, Callback akışları)
- `/[locale]/admin/*` (Sistem yöneticisi paneli)
- `/[locale]/cto/*` (Teknik yönetim paneli)
- Kullanıcıya özel dinamik protected layout'lar (Örn: Navbar'daki kullanıcı menüsü)

## 2. Hangi DAL Fonksiyonları `cookies()` / Auth Context Kullanıyor?
Mevcut mimaride `createClient()` (from `@/utils/supabase/server`) çağrılarak request bazlı cookie okuyan fonksiyonlar:
**`dal.ts` İçindekiler:**
- `getUserProfile`
- `getUserCollectionsWithDetails`
- `getUserSeriesStats`

**`action_dal.ts` İçindekiler:**
- `getAuthUser`
- `getAuthUserProfile`
- `signInWithPasswordDal`
- `signUpDal`
- `signOutDal`
- `signInWithOAuthDal`
- `exchangeCodeForSessionDal`
- `updateUserAuthEmailDal`
- `updateUserPasswordDal`

## 3. Hangi Fonksiyonlar `getAdminClient` (Service Role) Kullanıyor?
Veritabanında RLS'i bypass eden, gizli `SUPABASE_SERVICE_ROLE_KEY` ile çalışan mutasyon ve admin-read işlemleri:
**`action_dal.ts` İçindekiler:**
- `updateUserProfileDal`
- Admin Data Mutasyonları (`createDefinitionDal`, `insertNewsDal`, `insertSeriesDal`, `insertMinifigureDal`, `updateUserRoleDal`, `banUserDal` vb.)
- Koleksiyon/Rating İşlemleri (`addFigureToCollectionDal`, `createRatingDal` vb.)

**`media_dal.ts` İçindekiler:**
- `uploadImageDal`, `deleteImageDal` vb.

## 4. Accidental Dynamic De-opt Riski Taşıyan Fonksiyonlar
Bir public route (örneğin `/tr/haberler`), `dal.ts` içinden herhangi bir `getUserProfile` veya `getAuthUserProfile` çağıran fonksiyonla aynı dosyadan import yaparsa, Next.js tree-shaking sırasında veya dosya değerlendirmesinde `cookies()` kullanımını algılayabilir. Bu durum, tamamen statik kalması gereken bir sayfanın istem dışı `force-dynamic` davranış sergilemesine (TTFB sürelerinin uzamasına ve cache'in kırılmasına) yol açar.

## 5. Önerilen Yeni Yapı ve Parçalama Planı
Mevcut `dal.ts` ve `action_dal.ts` yapılarını sorumluluklarına göre böleceğiz:

- **`dal_public.ts`:** (Zaten başlatıldı) Sadece `createPublicClient()` kullanan, %100 anonim, SEO sayfalarını besleyen read-only fonksiyonlar.
- **`dal_private.ts`:** Kullanıcının auth context'ine (`cookies()`) bağımlı olan read-only fonksiyonlar (`getUserProfile`, `getUserCollectionsWithDetails`).
- **`dal_admin.ts`:** `getAdminClient()` kullanan ve RLS'i bypass eden tüm yönetici mutasyonları ve admin okumaları. (Şu anki `action_dal.ts`in büyük bir kısmı).
- **`action_dal.ts` (Sadeleştirilmiş):** Yalnızca sıradan kullanıcının public/private server action'larını tetiklediği ara katman (Rating ekleme, koleksiyona figür ekleme).
- **`auth_dal.ts` veya `authHelpers`:** Yalnızca session/cookie yönetimi, giriş/çıkış operasyonları.

## 6. Middleware ve Layout Sorumluluk Haritası
- **Middleware:** Rotanın URL pattern'ine bakarak (`/admin`, `/koleksiyonum`) JWT token doğrulamasını ve yetki kontrolünü (Role guard) `supabase.auth.getUser()` ile yapmalı. Public rotalarda auth lookup yapmadan hızlıca `next()` ile devam etmeli.
- **Root Layout:** Tüm sayfalara AuthProvider veya benzeri bir context sağlayacaksa, bunu public sayfaları de-opt etmeyecek (client-side initialization) yöntemlerle yapmalı.
- **Protected Layouts:** Yalnızca kendi içindeki children'lar için ekstra `getAuthUserProfile` sorgusu atmalı.

## 7. Mevcut Riskler ve Darboğazlar
- **Accidental Dynamic Render:** `dal.ts` içindeki karma importlar yüzünden public sayfaların yavaşlaması. (Şu anki public extraction bunu büyük ölçüde hafifletti ancak tamamen çözülmedi).
- **Circular Imports:** DAL dosyalarının birbirini import etme riski (Özellikle mapperlar ve type definisyonları ile).
- **Stale Session:** CSR ile SSR arasında Supabase auth session farklılıkları. Middleware updateSession çağrılarının public sayfalarda gereksiz header yazması.
- **Mixed Public/Private Imports:** Tek bir server action içinde hem public lookup hem de private `update` yapılması durumunda transaction takibinin zorlaşması.
