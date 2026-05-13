# Admin Panel Scope & Architecture Finalization

## 1. Admin Panel North Star
**Panelin Amacı:** 
- CMS (İçerik Yönetim Sistemi)
- Taxonomy (Kategori ve Tanım Yönetimi)
- Affiliate (Yönlendirme ve Referans Yönetimi)
- Lead / Audience (İletişim ve Kitle Yönetimi)
- Operational Health (Sistem Sağlığı ve Veri Kalitesi İzleme)

**Panelin Amacı Olmayanlar:**
- Infrastructure Config (Sunucu, DB, Vercel ayarları)
- Fake Analytics (Altı boş dönüşüm, tıklama ve borsa grafikleri)
- Marketplace Engine (Kullanıcılar arası alışveriş ve P2P trade)
- CRM / Mail Client (Panel içinden e-posta yanıtlama ve threading)

## 2. Keep (Korunacaklar)
- **Seriler, Figürler, Haberler, Hakkımızda:** Temel CMS varlıkları ve CRUD işlemleri.
- **Gerçek Taxonomy Alanları:** Sadece tekrar kullanılabilir (reusable) etiketler (Figür Rolü, Figür Tipi, Nadirlik Derecesi, Tema/Universe).
- **Contact Messages (İletişim Mesajları):** Sadece formdan gelen mesajların tutulduğu "Read-Only Archive" yapısı.
- **Newsletter / Audience List (Bülten Aboneleri):** Yalnızca aktif/pasif durumlarının ve e-postaların tutulduğu kitle listesi.

## 3. Simplify (Sadeleşecekler)
- **Dashboard → Operational Health:** Fake analitikler yerine eksik görseller, boş fiyatlar, İngilizce içeriği eksik kayıtlar ve bekleyen üyeler gibi aksiyona yönelik metrikler gösterilecek.
- **Definitions (Tanımlar) → Sadece Reusable Taxonomy:** Benzersizlik (Unique) sağlamak için "trim" ve "lowercase" kontrolleri zorunlu kılınacak.
- **Borsa / Fiyat → Indicative Price + Affiliate Link:** Borsa ve piyasa derinliği karmaşası atılarak sadece referans fiyat ve satın alma linki modeline geçilecek.
- **Slider → Locale-aware Validation:** İngilizce/Türkçe ayırımı kesinleştirilecek ve hardcoded (localhost vb.) hatalı yönlendirmeler engellenecek.
- **Contact / Newsletter Ayrımı:** CRM yanılgısını önlemek için mesajlar ve aboneler birbirinden tamamen bağımsız iki liste olarak ele alınacak.

## 4. Remove / Hide (Kaldırılacaklar / Gizlenecekler)
- **Fake Analytics:** Dönüşüm oranları, tıklama dağılımları ve temelsiz metrik panelleri.
- **Marketplace / Funnel / Conversion Dashboard:** Gerçek sistem altyapısı kurulana kadar asılsız borsa ekranları.
- **Infra / Auth / API Key Settings:** Standart admin menüsünden tüm konfigürasyon sayfaları çıkartılacak. (Yalnızca env/Vercel üzerinden yönetilecek).
- **CRM Reply / Threading Complexity:** Panel içinden mesaj yanıtlama ve zincir oluşturma yapıları.
- **Entity Olmayan Taxonomy Kategorileri:** Marka, Seri Adı gibi aslında Entity'e ait olan özelliklerin Tanımlar tablosundan silinmesi.

## 5. Backlog (Gelecek Planları)
- Marketplace / P2P Engine (Kullanıcıdan kullanıcıya takas ve satış)
- Advanced Analytics (Gerçek event tracking ile dönüşüm analizi)
- Resend Audience API / CSV Export (Panel üzerinden toplu bülten yönetimi ve dışa aktarım)
- Real Price Engine (BrickLink vb. API'lerden anlık piyasa değeri çekimi)
- Public Collector Growth Tools (Kullanıcı profil sayfaları ve sosyal özellikleri)

## 6. Admin IA Target Structure (Önerilen Sidebar Yapısı)
Yeni mimaride hedeflenen sol menü dizilimi:
- Dashboard
- İçerik
  - Seriler
  - Figürler
  - Haberler
  - Hakkımızda
  - Slaytlar
- Koleksiyon Verisi
  - Tanımlar
  - Fiyat / Affiliate
- Kitle & İletişim
  - Gelen Mesajlar
  - Bülten Aboneleri
- Sistem
  - Audit Logları
  - Kullanıcı Yönetimi

## 7. Implementation Phases
**Phase 4A: UI/IA Cleanup**
- Sidebar menülerinin (IA) temizlenmesi ve önerilen yapıya geçiş.
- Dashboard'un Operational Health formatına dönüştürülmesi.
- Auth/Keys konfigürasyonlarının normal menüden çıkarılması.
- Newsletter ve Contact ayrımının görünürlük seviyesinde (UI listeleri) yapılması.

**Phase 4B: Taxonomy Simplification**
- Definitions temizliği ve Duplicate Prevention (lowercase, trim) mantığının oturması.

**Phase 4C: Market Simplification**
- Price ve Affiliate alanlarının sadeleştirilmesi, borsa illüzyonunun kaldırılması.

**Phase 4D: i18n Hardening**
- Slider bileşeninde locale-aware yapının güçlendirilmesi.

## 8. Guardrails (Koruyucu Kurallar)
- **Veri Kaybı Yok:** DB tablosu SİLİNMEYECEK.
- **Şema Koruma:** Kolon SİLİNMEYECEK.
- **Migration Yok:** Faz 4 süresince migration scripti yazılmayacak.
- **Önce Görünüm:** Sadece IA (Bilgi Mimarisi) ve UI sadeleştirmesi ile başlanacak.
- **Ayrık Görevler:** Her modül için ayrı bir PR açılarak güvenli ilerlenecek.
