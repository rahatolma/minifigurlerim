# Post-Mortem & Technical Debt Backlog

Bu belge, geçmiş krizlerde yaşanan (Eksik import edilen alanlar, veritabanı schema kirliliği, kayıp veriler) olayların ardından platformun kriz modundan çıkıp "Stabil Geliştirme" moduna geçişi için hazırlanmış **Kesin Öncelik Sıralamasıdır**.

## Kronik Riskler (Çözülmezse Tekrar Edecek Olanlar)

1. **Import Pipeline Hardening (En Yüksek Risk)**
   - **Sorun:** Tarihsel olarak `piece_count` unutuldu, `figure_number` duplicate edildi, `slug` match'inde global ezilme yaşandı.
   - **Gerçek Risk:** Yeni bir LEGO serisi import edildiğinde aynı yanlışlıklarla veya eksikliklerle geri dönebilir. Import/Migration betiklerinin zırhlanması şarttır.

2. **Admin Validation Zayıflığı**
   - **Sorun:** Admin paneli `[yeni/page.tsx]` veya güncellemeler, veritabanına boş, tanımsız veya duplicate/hatalı series relation ile veri girmesine müsaade edecek kadar gevşek olabilir.
   - **Gerçek Risk:** İçerik editörü yanlış formatlı bir data, mükerrer `figure_code` girdiğinde sessizce kabul edip yine veriyi bozabilir. "Zorunlu alanlar" ve "Format kontrolleri" sıkılaştırılmalıdır.

3. **Otomatize Test Eksikliği**
   - **Sorun:** Platformdaki krizler gözle, canlı loglarla ve admin paneline bakılarak bulunuyor. Bu ciddi efor kaybıdır.
   - **Gerçek Risk:** Aynı ismin (Örn: Alien) farklı serilerde yaşayabildiği, Data Import'un hiçbir eski veriyi ezmediği, Detay Route'larının `[seriesSlug]/[figureSlug]` bağlamında kesin çalıştığı E2E (Playwright) veya Jest/Vitest betikleriyle "Makine seviyesinde" denetlenmeli.

4. **Figure_No Final Drop (Geçiş Takibi)**
   - **Sorun:** `figure_no` kullanımından kurtulunup `figure_number`'a (Canonical data) geçildi ancak kırılmayı engellemek adına çift-yazma (Dual write) bırakıldı.
   - **Gerçek Risk:** Takip edilmezse sonsuza dek öyle kalır. Kod tabanı audit'lerinden (Phase 4) sonra Drop edilmelidir.

5. **Schema Cleanup Audit**
   - **Sorun:** DB modelleriyle UI uyuşmazlıkları (Örn: `Aksesuar Sayısı` UI'da vardı DB'de farklıydı). 
   - **Gerçek Risk:** Eski scriptlerin bıraktığı hayalet/zombi mantıklar veri tabanını yorar, codebase'i çürütür. 

---

## Eylem Öncelik Sırası (Aksiyon Hedefi)
1. **Import Checklist + Hardening:** (Mevcut import scriptini sadece Upsert (By Code), zorunlu Validasyon ve test dry-run modlarına geçirme).
2. **Admin Validation:** (Admin paneline Zod veya Formiki ile Strict Schema Validation kurma).
3. **Route / Import / Mapping Testleri:** (Core mekanikler için test suite yazımı).
4. **figure_no Final Drop:** (Kodun temizlendiğine kanaat getirildiğinde Supabase üzerinden DROP işlemi).
5. **Schema Cleanup Audit:** (Tüm kalan tabloları ve kullanılmayan kolonları rapora döküp budama işlemi).
