# DB Schema Audit Report (May 2026)

## 1. Tüm Public Tabloların Listesi
- **Core Entity:** `minifigures`, `series`
- **Identity/Social:** `profiles`, `user_collections`, `user_series_stats`, `comments`
- **CMS/Content:** `news`, `pages`, `sliders`
- **Forms/Leads:** `newsletter_subscribers`, `contact_messages`
- **Ops/Logs:** `admin_audit_logs`, `user_governance_logs`, `data_normalization_logs`, `ai_translation_jobs`

## 2. Her Tablonun Amacı
- `minifigures` & `series`: Koleksiyonun ana materyalleri (ürün ve setler).
- `profiles`: Auth altyapısına bağlanan genişletilmiş kullanıcı verileri (avatar, admin flags, email).
- `user_collections`: Kullanıcı ve figür ilişkisi (have/want + qty).
- `user_series_stats`: Seriyi yüzde kaç tamamladı (cache/performans tablosu).
- `news`: Blok tabanlı (veya legacy HTML) blog yazıları.
- `comments`: Figür veya haberler altındaki kullanıcı yorumları.
- `admin_audit_logs` & `user_governance_logs`: Yönetici aksiyonlarının (ban, yetki, silme) değişmez denetim izi (Audit trail).
- `ai_translation_jobs` & `data_normalization_logs`: Arka planda çalışan çeviri ve veri temizleme scriptlerinin kuyruk logları.

## 3. Hangi Tablolar Aktif Kod Tarafından Kullanılıyor?
`minifigures`, `series`, `profiles`, `user_collections`, `user_series_stats`, `news`, `newsletter_subscribers`, `contact_messages`, `admin_audit_logs`, `comments` tabloları DAL fonksiyonlarında (client, private, action) sürekli CRUD operasyonlarına tabi.

## 4. Hangi Tablolar Kullanılmıyor Gibi Görünüyor?
- `sliders` ve `pages`: UI hardcode/modern block sistemine geçtikten sonra bu tabloların aktif kullanımı (slider yönetimi vs.) kod tabanında atıl (dead-code) kalmış olabilir. 
- `data_normalization_logs` & `ai_translation_jobs`: Script'ler bittiyse şu an inaktiftir.

## 5. Hangi Kolonlar Deprecated / Şüpheli Olabilir?
- `user_collections.status`: Yeni `qty` sistemine geçildiğinde (Phase 4'te) deprecated olacak.
- `news.content` / `content_en`: Şu an JSON string tutuyor ama `TEXT` tipinde tanımlı. Supabase'de `JSONB` olması gerekiyor. (Technical Debt).
- `minifigures.collection_count_30d`: İsmi "30d" (30 gün) olsa da trigger bunu "all-time" olarak artırıp azaltıyor. İsim/veri uyuşmazlığı var.

## 6. Foreign Key İlişkileri
- `minifigures.series_id` → `series.id`
- `user_collections.user_id` / `user_series_stats.user_id` → `auth.users.id` (veya `profiles.id`)
- `user_collections.minifigure_id` → `minifigures.id`
- `admin_audit_logs.target_user_id` → `profiles.id`

## 7. Orphan Riskleri (Sahipsiz Kayıt Riski)
- Eğer Supabase tarafında `ON DELETE CASCADE` kuralları eksikse; bir `minifigure` veritabanından silinirse, o figürü takip eden 500 kişinin `user_collections` tablosunda geçersiz bir UUID kalır ve bu UI tarafında hata patlatır.

## 8. Cascade Davranışları
Supabase genelde `auth.users` silindiğinde bağlı `profiles` ve `user_collections` verilerini kaskad olarak başarıyla temizler. Ancak admin bir haberi veya figürü sildiğinde `comments` tablosundaki verilerin patlamaması için Cascade yapısı aktif tutulmalıdır.

## 9. Index / Unique Constraint Özeti
- `user_collections`: `UNIQUE(user_id, minifigure_id)`
- `user_series_stats`: `UNIQUE(user_id, series_id)`
- `minifigures.slug`: `UNIQUE` constraint eklendi.

## 10. RLS Policy Özeti
- RLS sistemin tüm tablolarında aktif.
- Public Select (Okuma) => `minifigures`, `series`, `news`, `comments(status='approved')`.
- Authenticated Select/Insert => `user_collections` ve `profiles` (`auth.uid() = user_id` şartıyla).

## 11. Service Role Gerektiren Tablolar
- `admin_audit_logs`, `user_governance_logs` RLS nedeniyle admin servis yetkisi gerektirir.
- `action_dal.ts` içindeki `toggleUserCollectionDal` fonksiyonu `getAdminClient()` (Service Role) kullanır. Bu durum RLS'i bypass eder.

## 12. Public Read Açık Olan Tablolar
`minifigures`, `series`, `news` ve `pages`. Herkes API üzerinden `apiKey` ile verileri okuyabilir.

## 13. Güvenlik Riski Taşıyan Tablolar
- `contact_messages` ve `newsletter_subscribers`: Bu tabloların "Public Read" RLS politikası KESİNLİKLE kapalı olmalıdır. Sadece "Anon Insert" (yazma) açık olmalı.
- `profiles`: `email` ve `full_name` kolonları public read'e açıksa PII ihlali riski vardır. Sadece username public olmalı.

## 14. Temizlenmesi Önerilen Ama Şu An DOKUNULMAMASI Gereken Alanlar
- `status` kolonu (UI/DAL tamamen geçene kadar dokunulmamalı).
- `news.content` (TEXT'ten JSONB'ye dönüşüm planlanmalı).
- `sliders` ve `pages` atıl tabloları incelenip drop edilmeli.
