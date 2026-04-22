# Data Contract & Uniqueness Architecture

Bu belge, Minifigürlerim platformundaki veri eşleşmesi (import) ve rotalama (routing) kurallarını sabitler.
Geçmişte yaşanan "Aynı isimli figürlerin birbirini ezmesi (Data Loss)" probleminin tekrar yaşanmaması için aşağıdaki 4 kural **değiştirilemez bir standarttır**.

## Kurallar

### 1. Figür Route Çözümü (Contextual Routing)
**KURAL:** Figür URL'leri çözümlenirken `figureSlug` ASLA tek başına kullanılamaz.
- **Doğru Altyapı:** `seriesSlug` + `figureSlug`
- **Açıklama:** Veritabanına (DAL) istek atılırken her zaman Seri Context'i (`seriesSlug`) fonksiyona paslanmalıdır (örn: `getMinifigureBySlug(slug, locale, seriesSlug)`). PostgREST Inner Join ile eşleşme yapılmalıdır. 

### 2. Dedupe / Import Eşleşmesi
**KURAL:** Toplu veri aktarımlarında (Import / Rescue / Migration) eşleştirme anahtarı asla `name` veya `slug` olamaz.
- **Doğru Altyapı:** `figure_code` (Örn: `col12-8`)
- **Açıklama:** Veritabanına veri basılırken (Insert / Upsert), kaydın mevcut olup olmadığı sadece `figure_code` ile kontrol edilir. Figure Code, sistemin biricik (Identity) anahtarıdır.

### 3. Uniqueness (Benzersizlik Kapsamı)
**KURAL:** Veritabanındaki `slug_tr` ve `slug_en` kilitleri tüm veritabanı çapında DEĞİL, ilgili serinin kendi içinde geçerlidir.
- **Doğru Altyapı:** `UNIQUE (series_id, slug_tr)` (Composite Index)
- **Açıklama:** Farklı LEGO serilerindeki figürler, birbirinin tamamen aynısı isimlere (Örn: `Alien`, `Lifeguard`, `Fitness Instructor`, `Fencer`) sahip olabilirler. Sistemin Composite kilitleri sayesinde, her biri kendi serisi altında aynı slug adı ile barış içinde barınır.

### 4. Global Name/Slug Dedupe YASAKTIR
**KURAL:** Figür ismine otomatik seri eki ekleyerek (Örn: `alien-serisi-6`) yapay "Global Unique Slug" üretmek kesinlikle **YASAKTIR**.
- **Açıklama:** Bu tür geçici "quick-hack" yamalar (örneğin dublicate'i önlemek için sonuna `-zombie` eklemek veya global uniqueness için zorla isim değiştirmek) mimari kırılmalara yol açmıştır. Çözüm isim değiştirmekte değil, kapsamı (scope) daraltmaktır.
