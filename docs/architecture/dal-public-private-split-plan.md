# DAL Public/Private Split Plan

Bu doküman, Minifigürlerim projesinde ISR/Statik sayfaların gizlice `force-dynamic` (dinamik render) moduna düşmesini engellemek ve güvenlik sınırlarını netleştirmek için yapılacak büyük Data Access Layer (DAL) ayrıştırma operasyonunun yol haritasıdır.

---

## 1. Mevcut DAL Dosyaları

- `src/services/dal.ts`: Projenin büyük çoğunluğunu barındıran okuma (read) işlemlerinin olduğu dosya. Ancak hem public okumaları (cookie istemeyen) hem de private okumaları (cookie okuyan) aynı dosyada barındırıyor.
- `src/services/action_dal.ts`: Server Action'lar ve API route'ları için yazma (mutation), admin okumaları ve kompleks işlemleri barındırıyor.

---

## 2. Client Factory Haritası

Mevcut sistemde 4 farklı Supabase Client oluşturma yöntemi bulunuyor. Hatalı client kullanımı performans veya güvenlik açıklarına yol açmaktadır.

| Factory / Helper | Tanım Yeri | Cookie Okuyor mu? | Service Role (Admin) mi? | Ne İçin Kullanılmalı? |
| :--- | :--- | :---: | :---: | :--- |
| `createClient()` | `@/utils/supabase/server` | **EVET** | HAYIR (User Context) | Sadece oturum açmış kullanıcı verisi okuma / yazma (Private) |
| `createPublicClient()` | `@/utils/supabase/public` | HAYIR | HAYIR (Anon Context) | Public sayfalardaki (Anasayfa, Figür Detay) statik okumalar |
| `getAdminClient()` | `action_dal.ts` | HAYIR | **EVET** (Bypass RLS) | Sadece Admin yetkisi gerektiren kritik yazma işlemleri |
| `getPublicClient()` | `action_dal.ts` | HAYIR | HAYIR (Anon Context) | `action_dal.ts` içindeki public read işlemleri |

*⚠️ **Kritik Sorun:** `createClient()` fonksiyonu `cookies()` çağırdığı için, bu client'ı kullanan herhangi bir fonksiyon (örn: `getUserProfile`) yanlışlıkla public bir sayfaya veya layout'a import edilirse, Next.js tüm sayfayı cache'ten çıkarıp **dynamic render'a** zorlar (TTFB yavaşlar).*

---

## 3. Fonksiyon Envanteri (Örneklem)

Aşağıdaki tablo, risk taşıyan ve ayrıştırılması gereken fonksiyonların analizidir.

| Fonksiyon | Dosya | Kullanılan Client | Public/Private | Tip | Cookie? | Çağıran Yerler | Risk |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `getSeriesList` | `dal.ts` | `createPublicClient` | Public | Read | Hayır | Pages, Layouts | Low |
| `getMinifigureBySlug` | `dal.ts` | `createPublicClient` | Public | Read | Hayır | Figure Detail Page | Low |
| `getUserProfile` | `dal.ts` | `createClient` | Private | Read | **Evet** | Auth Context, Dashboards | **HIGH** |
| `getUserCollections...`| `dal.ts` | `createClient` | Private | Read | **Evet** | Koleksiyonum Sayfası | **HIGH** |
| `getAuthUser` | `action_dal.ts` | `createClient` | Private | Read | **Evet** | Tüm Server Actions | **HIGH** |
| `adminBanUserDal` | `action_dal.ts` | `getAdminClient` | Admin | Mutation | Hayır | Admin Panel Actions | Medium |
| `saveUserRatingDal` | `action_dal.ts` | `getAdminClient` | Admin | Mutation | Hayır | Collection Actions | Medium |

---

## 4. Önerilen Ayrım

Bu karmaşayı gidermek için DAL katmanı 4 net dosyaya bölünecektir:

1. **`dal_public.ts` (SADECE PUBLIC READ):**
   - İçerisinde ASLA `createClient` (cookie okuyan) importu barındırmayacak.
   - Sadece `createPublicClient` kullanılacak.
   - Tüm public sayfalar (`/`, `/figurler`, `/haberler` vs.) sadece bu dosyadan import yapacak.
   - *Mevcut `dal.ts`'nin %90'ı buraya taşınacak.*

2. **`dal_private.ts` (USER CONTEXT):**
   - Sadece login olmuş kullanıcının kendi verisini okuyan (Read) fonksiyonlar barındıracak.
   - Sadece `createClient()` kullanacak.
   - Örn: `getUserProfile`, `getUserCollectionsWithDetails`, `getUserSeriesStats`.

3. **`action_dal.ts` (MUTATIONS & ADMIN):**
   - Veritabanına yazma (Insert/Update/Delete) işlemleri burada kalacak.
   - Service Role (`getAdminClient`) kullanan tüm admin işlemleri burada kalacak.
   - Mevcut yapısını büyük ölçüde koruyacak ancak public okumalar `dal_public.ts`'e kaydırılacak.

---

## 5. Migration Strategy (Taşıma Adımları)

Büyük kod tabanını kırmadan güvenli geçiş için:

- **Step 1:** `src/services/dal_public.ts` dosyasını oluştur. `dal.ts` içindeki sadece `createPublicClient` kullanan (cookie bağımsız) fonksiyonları taşı.
- **Step 2:** Next.js sayfa ve componentlerindeki import yollarını `dal.ts` yerine `dal_public.ts` olarak güncelle.
- **Step 3:** `src/services/dal_private.ts` dosyasını oluştur. `getUserProfile` gibi cookie okuyan fonksiyonları `dal.ts`'den buraya taşı. İlgili yerlerin importlarını güncelle.
- **Step 4:** `dal.ts` dosyasını tamamen sil.
- **Step 5:** `action_dal.ts` içindeki ufak tefek public read fonksiyonlarını (örn: `getFigureRatings`) `dal_public.ts`'e taşı.

---

## 6. Riskler ve Mitigation

- **Accidental Dynamic Render (Bypass Cache):** Private DAL fonksiyonunun public sayfaya import edilmesi. *Çözüm:* İzolasyon sonrası ESLint kuralları eklenebilir veya strict review yapılabilir.
- **RLS Permission Gaps:** Service Role ile mutation yapılırken kullanıcının yetkisinin `action_dal.ts` içinde tam kontrol edilmemesi. *Çözüm:* `getAuthUser` kontrolü zorunlu kılınacak.
- **Broken Route Imports:** Taşıma sırasında onlarca sayfanın import yolu değişeceği için `npm run build` ile type check zorunlu.
- **Circular Imports:** DAL dosyalarının birbirini çağırmaması sağlanmalı (Katman kuralı).

---

## 7. Test Planı

Migration tamamlandığında uygulanacak validation listesi:

1. `npm run build` ile statik/dinamik sayfa raporunu kontrol et (Public sayfaların ○ (Static) olduğundan emin ol).
2. **Public Smoke Test:** Gizli modda anasayfa, seri listesi ve figür detaylarını aç.
3. **Auth Smoke Test:** Login ol ve `/koleksiyonum` sayfasındaki verilerin yüklendiğini gör.
4. **Admin Panel:** Herhangi bir admin action'ı tetikle (Service Role testi).
5. **Vercel Logs:** Middleware ve Hydration mismatch hataları aranacak.
