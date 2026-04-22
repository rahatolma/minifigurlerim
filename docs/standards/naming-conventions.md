# Minifigürlerim Naming Convention & Microcopy Standard

**Status:** Active  
**Owner:** Frontend / Content  
**Last Updated:** 17 Nisan 2026  

**TL;DR:** Bu platformda tüm isimlendirme "collector authority" tonunda yapılır. Slug'lar sabittir. TR/EN karşılıklar standarttır. Rastgele varyasyon yasaktır.

---

## 1. Amaç
- Tüm platformda isim, slug ve metin tutarlılığı sağlamak.
- SEO parçalanmasını engellemek.
- Marka dilini sabitlemek ve "E-ticaret dükkanı" zihniyetinden kaçınıp "Koleksiyoner Ansiklopedisi" duruşunu korumak.

## 2. Temel Terminoloji (TR ↔ EN Sözlük)

| Alan | TR Doğru | EN Doğru | Yasak |
|---|---|---|---|
| Seri | LEGO® Minifigürler Serisi | LEGO® Minifigure Series | "Mini figür serisi" |
| Seriler | LEGO® Minifigürler Serileri | Minifigure Series | "Series List", "Koleksiyon Serileri" |
| Figür | Minifigür | Minifigure | "Karakter", "Oyuncak", "Adam", "Kişi" |
| Koleksiyon | Koleksiyon | Collection | "Sepet", "Kasa", "Profil" |

## 3. Slug Kuralları
- Slug bir kez oluşturulur, değişmez. Veritabanı ve URL yapısının anahtarıdır.
- Her zaman **küçük harf** kullanılır.
- **Türkçe karakter dönüşümü** kesin kurallara bağlıdır:
  - `ş` → `s`, `ç` → `c`, `ı` → `i`, `ğ` → `g`, `ö` → `o`, `ü` → `u`
- Tüm boşluklar ve özel karakterler tırnak işareti (dash `-`) ile değiştirilir.
- **Örnek:** "LEGO® Minifigürler Serisi 1" → `lego-minifigurler-serisi-1`

## 4. Menü & UI Kuralları

**Menü Kullanımı**
- TR Navigasyon: "Seriler", "Figürler"
- EN Navigasyon: "Series", "Figures"

**Breadcrumb (Navigasyon İzi)**
- Her zaman standart terim kökleri kullanılır. (Örn: *Ana Sayfa > Seriler > LEGO® Minifigürler Serisi 1*)
- Context'e (sayfaya) göre kısaltma veya varyasyon ("1. Seri", "Bu Seri") **yasaktır**.

## 5. Meta Kuralları

**Meta Title Pattern**
Platformun arama motoru görünürlüğünü konsolide etmek için:
- **TR Meta:** `[Seri/Figür Adı] | LEGO® Minifigürler Serisi`
  - *Örnek:* `LEGO® Minifigürler Serisi 1 | LEGO® Minifigürler Serisi`
- **EN Meta:** `[Series/Figure Name] | LEGO® Minifigure Series`
  - *Örnek:* `LEGO® Minifigures Series 1 | LEGO® Minifigure Series`

## 6. Sınır İhlali (Validation) Mekanizması
Kod içindeki `naming-standards.ts` helper sınıfı isimlendirmeleri üç kademede denetler. Amaç editoryal yeteneği boğmadan sistem doğruluğunu sağlamaktır:

**[KIRMIZI ÇİZGİ] Hard Fail (Sert Ret)**
Bu kelimeler Database'e **kesinlikle kayıt edilemez**, UI'da işlem "Admin Kayıt Hatası" pop-up'ıyla durdurulur:
- **mini figür serisi** (Kesinlikle reddedilir)
- **series list**
- **sepet** / **kasa** (E-ticaret dilleri yasak)

**[SARI ÇİZGİ] Warning (Uyarı / Soft Fail)**
Kullanılması önerilmez, form kaydı başarılı olur ancak loglarda "Editoryal İhlal" uyarısı bırakır:
- **mini figür** (Hızlı yazım mecburiyetleri için)
- **oyuncak** / **adam**
- **karakter**

**[İSTİSNA KÜMESİ] Exceptions**
İçerisinde "sarı çizgi" yasaklarını barından ama **lisanslı / özel isimler** olduğu için serbest bırakılanlar kümesi (Yanlış pozitif engeli):
- **Örümcek Adam** / **Demir Adam** (İçinde 'adam' olsa bile serbesttir)
- **Oyuncak Hikayesi** (İçinde 'oyuncak' olsa bile Toy Story lisansıdır)


## 7. Doğru / Yanlış Örnekler

❌ "Yeni Lego Mini figür serisi geldi, karakterlerini sepete ekle!"
✅ "Yeni LEGO® Minifigürler Serisi yayında. Parçaları koleksiyonuna dahil et."

❌ "Series List ekranından istediğin adamı bul."
✅ "Seriler (Series) sayfasından eksik minifigürlerini incele."

## 8. Kod Entegrasyonu
- `src/utils/validations/naming-standards.ts` içindeki TS kalkanı bu kuralları **enforce (mecburi)** eder.
- Özellikle Admin Panel'den içerik girilirken `normalizeSlug()` helper metodu zorunludur. Yanlış harflerle basılmış DB kayıtları Next.js SSG yapısını bozacaktır.

## 9. Update Trigger
Bu doküman ne değişirse güncellenmek (ve PR içinde gönderilmek) zorunda?
- Yeni bir veritabanı kategorisi veya modeli (Taksonomi) eklendiğinde.
- Platforma yeni bir dil seçeneği (Örn: DE, FR) eklendiğinde.
- Global SEO stratejisi (Title pattern) veya marka dili direktifi geldiğinde.
