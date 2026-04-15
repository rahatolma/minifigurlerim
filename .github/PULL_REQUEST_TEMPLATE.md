# Pull Request Standard Checklist

Lütfen kodunuzun "Global Performance Standard v1.0" anayasasına tam uyumlu olduğunu onaylayın.

## 🛑 Kırmızı Çizgiler (Zorunlu)
- [ ] `select('*')` veya relation bazlı gevşek yıldız (örn. `series(*)`) kesinlikle KULLANILMADI. Yalnızca net tanımlanmış "Projection" (kolon listesi) çağrıldı.
- [ ] Veritabanı (Supabase) çağrıları `src/services/` veya `src/actions/` dışında bir klasörde YAPILMADI (DAL dışı erişim yok).
- [ ] Sözel `0` değeri ile veri yokluğunu temsil eden `null` / `undefined` ASLA birbirine karıştırılmadı.
- [ ] Front-End bileşenleri doğrudan Raw Database nesnesi okumuyor, veri bir DTO/Mapper üzerinden süzülüp `partial` edildi (Bypass uyarısı gözden geçirildi).

## 🛡️ Dayanıklılık (Resilience & Matrix)
- [ ] **Field Criticality Matrix:** Yeni eklenen veriler için Hangi alanın `Drop` (Tier 1), hangisinin `Degrade` (Tier 2) ve hangisinin `Fallback` (Tier 3) edileceği tasarlandı ve kodlandı.
- [ ] **Partial Failure:** Bileşen içerisinde herhangi bir Sub-Query çökse dahi sayfa 500 kodu yemeyecek biçimde kurgulandı (Fallback State / Degraded Blocks mevcut).
- [ ] **Monitoring:** Yeni yazılan Data erişim metodu `withMonitoring` gibi standard kalkanlarla sarıldı. Süre kayıpları izlenebilecek şekilde yapılandırıldı.

---
*Not: Bu PR gönderildiği an CI Pipeline (Standard Enforcer) tüm statik kodunuzu tarayacak. Uyarı alırsanız hata mesajında belirtilen satırları yönergelerle düzeltiniz.*
